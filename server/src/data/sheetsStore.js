/**
 * Google Sheets store.
 *
 * Design goals (see README "Performance" and "Google Sheets"):
 *  - All reads come from an in-memory cache loaded at start-up and refreshed
 *    periodically, so page loads never wait on the Sheets API.
 *  - All writes are queued and flushed in batches every SHEETS_FLUSH_MS
 *    milliseconds using values.batchUpdate / values.append. A classroom of
 *    students auto-saving therefore produces a handful of API calls per flush
 *    instead of one call per keystroke or per student.
 *  - Missing worksheets are created automatically with the correct header row.
 *  - Transient API errors (429 rate limit, 5xx) are retried with back-off.
 *
 * Limitation: the cache lives inside one server process. Run exactly one
 * server instance against a given spreadsheet.
 */
import { google } from 'googleapis';
import { BaseStore } from './store.js';
import { TABLES, rowToObject, objectToRow } from './schema.js';
import { logger } from '../lib/logger.js';

function colLetter(n) {
  // 1 -> A, 26 -> Z, 27 -> AA
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function quote(name) {
  return `'${name.replace(/'/g, "''")}'`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class SheetsStore extends BaseStore {
  constructor({ sheetId, serviceAccountEmail, privateKey, flushMs = 2500, refreshSeconds = 60 }) {
    super();
    if (!sheetId || !serviceAccountEmail || !privateKey) {
      throw new Error('Google Sheets store requires GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY');
    }
    this.sheetId = sheetId;
    this.auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    this.api = google.sheets({ version: 'v4', auth: this.auth });
    this.flushMs = flushMs;
    this.refreshSeconds = refreshSeconds;
    this.headers = {}; // table -> header row array
    this.rowIndex = {}; // table -> Map(id -> 1-based row number)
    this.sheetIds = {}; // table -> numeric sheetId (for deleteDimension)
    this.queue = {}; // table -> { inserts: Map, updates: Map, removes: Map }
    for (const t of Object.keys(TABLES)) {
      this.rowIndex[t] = new Map();
      this.queue[t] = { inserts: new Map(), updates: new Map(), removes: new Map() };
    }
    this.flushTimer = null;
    this.flushing = null;
    this.refreshTimer = null;
    this.waiters = [];
  }

  async withRetry(fn, label) {
    let delay = 500;
    for (let attempt = 1; attempt <= 6; attempt++) {
      try {
        return await fn();
      } catch (err) {
        const status = err?.code || err?.response?.status;
        const retryable = status === 429 || (status >= 500 && status < 600) || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT';
        if (!retryable || attempt === 6) throw err;
        logger.warn(`Sheets ${label} failed (${status}); retrying in ${delay}ms (attempt ${attempt})`);
        await sleep(delay);
        delay = Math.min(delay * 2, 15000);
      }
    }
    return undefined;
  }

  async init() {
    await this.auth.authorize();
    await this.ensureWorksheets();
    for (const table of Object.keys(TABLES)) await this.loadTable(table);
    if (this.refreshSeconds > 0) {
      this.refreshTimer = setInterval(() => this.refreshAll().catch((e) => logger.warn('Sheets refresh failed:', e.message)), this.refreshSeconds * 1000);
      this.refreshTimer.unref?.();
    }
    logger.info(`Google Sheets store ready (spreadsheet ${this.sheetId.slice(0, 6)}…)`);
  }

  async ensureWorksheets() {
    const meta = await this.withRetry(() => this.api.spreadsheets.get({ spreadsheetId: this.sheetId }), 'get metadata');
    const existing = new Map(meta.data.sheets.map((s) => [s.properties.title, s.properties.sheetId]));
    const missing = Object.keys(TABLES).filter((t) => !existing.has(t));
    if (missing.length) {
      const res = await this.withRetry(
        () => this.api.spreadsheets.batchUpdate({
          spreadsheetId: this.sheetId,
          requestBody: { requests: missing.map((title) => ({ addSheet: { properties: { title } } })) },
        }),
        'create worksheets',
      );
      for (const reply of res.data.replies) existing.set(reply.addSheet.properties.title, reply.addSheet.properties.sheetId);
      await this.withRetry(
        () => this.api.spreadsheets.values.batchUpdate({
          spreadsheetId: this.sheetId,
          requestBody: {
            valueInputOption: 'RAW',
            data: missing.map((t) => ({ range: `${quote(t)}!A1`, values: [TABLES[t].columns] })),
          },
        }),
        'write headers',
      );
      logger.info(`Created worksheets: ${missing.join(', ')}`);
    }
    for (const t of Object.keys(TABLES)) this.sheetIds[t] = existing.get(t);
  }

  async loadTable(table) {
    const res = await this.withRetry(
      () => this.api.spreadsheets.values.get({ spreadsheetId: this.sheetId, range: quote(table), valueRenderOption: 'UNFORMATTED_VALUE' }),
      `load ${table}`,
    );
    const values = res.data.values || [];
    let header = values[0] || [];
    const def = TABLES[table];
    // Add any missing columns to the header row (schema upgrades).
    const missingCols = def.columns.filter((c) => !header.includes(c));
    if (!header.length || missingCols.length) {
      header = [...header, ...missingCols];
      await this.withRetry(
        () => this.api.spreadsheets.values.update({
          spreadsheetId: this.sheetId,
          range: `${quote(table)}!A1`,
          valueInputOption: 'RAW',
          requestBody: { values: [header] },
        }),
        `upgrade header ${table}`,
      );
    }
    this.headers[table] = header;
    const idCol = def.id;
    const idIdx = header.indexOf(idCol);
    const map = new Map();
    const index = new Map();
    for (let i = 1; i < values.length; i++) {
      const cells = values[i] || [];
      const id = cells[idIdx];
      if (id === undefined || id === '') continue;
      const obj = rowToObject(table, header, cells);
      map.set(String(id), obj);
      index.set(String(id), i + 1); // 1-based row number
    }
    this.cache[table] = map;
    this.rowIndex[table] = index;
  }

  hasPending(table) {
    const q = this.queue[table];
    return q.inserts.size || q.updates.size || q.removes.size;
  }

  async refreshAll() {
    for (const table of Object.keys(TABLES)) {
      if (this.hasPending(table)) continue; // never clobber unsaved local writes
      await this.loadTable(table);
    }
  }

  scheduleFlush() {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      this.flushing = this.runFlush().catch((e) => logger.error('Sheets flush failed:', e.message)).finally(() => {
        this.flushing = null;
        const w = this.waiters; this.waiters = [];
        w.forEach((r) => r());
        if (Object.keys(TABLES).some((t) => this.hasPending(t))) this.scheduleFlush();
      });
    }, this.flushMs);
  }

  async persistInsert(table, row) {
    this.queue[table].inserts.set(row[TABLES[table].id], row);
    this.scheduleFlush();
  }

  async persistUpdate(table, row) {
    const id = row[TABLES[table].id];
    const q = this.queue[table];
    if (q.inserts.has(id)) q.inserts.set(id, row); // not yet in sheet: just replace the pending insert
    else q.updates.set(id, row);
    this.scheduleFlush();
  }

  async persistRemove(table, row) {
    const id = row[TABLES[table].id];
    const q = this.queue[table];
    if (q.inserts.has(id)) { q.inserts.delete(id); return; }
    q.updates.delete(id);
    q.removes.set(id, row);
    this.scheduleFlush();
  }

  async runFlush() {
    // 1) Updates: one values.batchUpdate for all tables.
    const data = [];
    const updatedTables = [];
    for (const table of Object.keys(TABLES)) {
      const q = this.queue[table];
      if (!q.updates.size) continue;
      const header = this.headers[table];
      const last = colLetter(header.length);
      for (const [id, row] of q.updates) {
        const rowNum = this.rowIndex[table].get(id);
        if (!rowNum) { q.inserts.set(id, row); continue; } // row vanished from sheet; re-insert
        data.push({ range: `${quote(table)}!A${rowNum}:${last}${rowNum}`, values: [objectToRow(table, header, row)] });
      }
      q.updates.clear();
      updatedTables.push(table);
    }
    if (data.length) {
      await this.withRetry(
        () => this.api.spreadsheets.values.batchUpdate({ spreadsheetId: this.sheetId, requestBody: { valueInputOption: 'RAW', data } }),
        'batch update',
      );
      logger.debug(`Sheets: updated ${data.length} rows in ${updatedTables.join(', ')}`);
    }
    // 2) Inserts: one append per table.
    for (const table of Object.keys(TABLES)) {
      const q = this.queue[table];
      if (!q.inserts.size) continue;
      const header = this.headers[table];
      const ids = Array.from(q.inserts.keys());
      const rows = ids.map((id) => objectToRow(table, header, q.inserts.get(id)));
      q.inserts.clear();
      const res = await this.withRetry(
        () => this.api.spreadsheets.values.append({
          spreadsheetId: this.sheetId,
          range: `${quote(table)}!A1`,
          valueInputOption: 'RAW',
          insertDataOption: 'INSERT_ROWS',
          requestBody: { values: rows },
        }),
        `append ${table}`,
      );
      const range = res.data.updates?.updatedRange || '';
      const m = range.match(/![A-Z]+(\d+)/);
      if (m) {
        const start = Number(m[1]);
        ids.forEach((id, i) => this.rowIndex[table].set(id, start + i));
      } else {
        await this.loadTable(table);
      }
      logger.debug(`Sheets: appended ${rows.length} rows to ${table}`);
    }
    // 3) Removes: delete rows (highest first) then reload the table index.
    for (const table of Object.keys(TABLES)) {
      const q = this.queue[table];
      if (!q.removes.size) continue;
      const rowNums = Array.from(q.removes.keys()).map((id) => this.rowIndex[table].get(id)).filter(Boolean).sort((a, b) => b - a);
      q.removes.clear();
      if (rowNums.length) {
        await this.withRetry(
          () => this.api.spreadsheets.batchUpdate({
            spreadsheetId: this.sheetId,
            requestBody: {
              requests: rowNums.map((r) => ({
                deleteDimension: { range: { sheetId: this.sheetIds[table], dimension: 'ROWS', startIndex: r - 1, endIndex: r } },
              })),
            },
          }),
          `delete rows ${table}`,
        );
        // Re-index without discarding cache (cache is already authoritative).
        const res = await this.withRetry(
          () => this.api.spreadsheets.values.get({ spreadsheetId: this.sheetId, range: `${quote(table)}!A:A` }),
          `reindex ${table}`,
        );
        const col = res.data.values || [];
        const idIdx = this.headers[table].indexOf(TABLES[table].id);
        const index = new Map();
        if (idIdx === 0) for (let i = 1; i < col.length; i++) if (col[i]?.[0]) index.set(String(col[i][0]), i + 1);
        if (idIdx === 0) this.rowIndex[table] = index; else await this.loadTable(table);
      }
    }
  }

  async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
      this.flushing = this.runFlush();
    }
    if (this.flushing) await this.flushing;
    while (Object.keys(TABLES).some((t) => this.hasPending(t))) await this.runFlush();
  }

  async close() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    await this.flush();
  }
}
