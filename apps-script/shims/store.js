/**
 * Google Sheets store for the Apps Script edition.
 *
 * Designed for classroom-to-cohort load (hundreds of students saving at once):
 *  - Small tables (Users, Students, Groups, Assessments, Questions, Settings) are read
 *    in one call when first needed.
 *  - Large tables (Answers, Attempts, ProctoringLogs) are read ONLY for the rows that
 *    belong to the current request (TextFinder on a scope column such as student_id),
 *    so a student's save never downloads the whole Answers sheet.
 *  - Append-only tables (AuditLogs, ProctoringLogs) are written without reading them.
 *  - Lecturer screens that list logs read only the most recent N rows (tail).
 * Every change is written straight to the sheet (no cache between requests).
 */
import { BaseStore } from '../../server/src/data/store.js';
import { TABLES, rowToObject, objectToRow } from '../../server/src/data/schema.js';

/** Columns a request may scope a large table by. */
const SCOPE_COLUMNS = {
  Answers: ['student_id', 'group_id', 'assessment_id'],
  Attempts: ['student_id', 'attempt_id', 'group_id'],
  ProctoringLogs: ['student_id', 'group_id'],
  BusinessProposals: ['group_id'],
  GroupReports: ['group_id'],
};
const APPEND_ONLY = new Set(['AuditLogs', 'ProctoringLogs']);

export class SpreadsheetStore extends BaseStore {
  constructor(spreadsheet) {
    super();
    this.ss = spreadsheet;
    this.loaded = new Set(); // tables fully loaded
    this.partial = new Set(); // tables loaded for a scope only
    this.sheets = {};
    this.headers = {};
    this.rowIndex = {};
    this.scope = {}; // e.g. { student_id: 'stu_1' }
    this.tail = {}; // e.g. { ProctoringLogs: 500 }
    for (const t of Object.keys(TABLES)) this.rowIndex[t] = new Map();
  }

  /** Request-level hints set by the router before handlers run. */
  setScope(scope = {}, tail = {}) { this.scope = scope || {}; this.tail = tail || {}; }

  sheet(table) {
    if (this.sheets[table]) return this.sheets[table];
    let sh = this.ss.getSheetByName(table);
    if (!sh) {
      sh = this.ss.insertSheet(table);
      sh.getRange(1, 1, 1, TABLES[table].columns.length).setValues([TABLES[table].columns]);
      sh.getRange(1, 1, sh.getMaxRows(), TABLES[table].columns.length).setNumberFormat('@'); // keep everything as text (no auto-dates)
      sh.setFrozenRows(1);
    }
    this.sheets[table] = sh;
    return sh;
  }

  header(table) {
    if (this.headers[table]) return this.headers[table];
    const sh = this.sheet(table);
    const def = TABLES[table];
    const width = Math.max(sh.getLastColumn(), def.columns.length);
    let header = sh.getRange(1, 1, 1, width).getValues()[0].map((h) => String(h || '').trim());
    const missing = def.columns.filter((c) => !header.includes(c));
    if (!header.filter(Boolean).length || missing.length) {
      header = [...header.filter(Boolean), ...missing];
      sh.getRange(1, 1, 1, header.length).setValues([header]);
      sh.getRange(1, 1, sh.getMaxRows(), header.length).setNumberFormat('@');
    }
    this.headers[table] = header;
    return header;
  }

  /** Create every worksheet with its header row (used by setup()). */
  ensureAll() { for (const t of Object.keys(TABLES)) this.header(t); }

  assertTableName(table) { if (!TABLES[table]) throw new Error(`Unknown table: ${table}`); }

  ingest(table, header, cells, rowNumber) {
    const idIdx = header.indexOf(TABLES[table].id);
    const id = cells[idIdx];
    if (id === undefined || id === null || id === '') return;
    this.cache[table].set(String(id), rowToObject(table, header, cells));
    this.rowIndex[table].set(String(id), rowNumber);
  }

  /** Load the rows needed for this request: scoped, tail-only, or everything. */
  ensureLoaded(table) {
    this.assertTableName(table);
    if (this.loaded.has(table) || this.partial.has(table)) return;
    const sh = this.sheet(table);
    const header = this.header(table);
    const lastRow = sh.getLastRow();
    const scopeCol = (SCOPE_COLUMNS[table] || []).find((c) => this.scope[c] !== undefined && this.scope[c] !== '');
    if (scopeCol && lastRow > 1) {
      const col = header.indexOf(scopeCol) + 1;
      const finder = sh.getRange(2, col, lastRow - 1, 1).createTextFinder(String(this.scope[scopeCol])).matchEntireCell(true).matchCase(true);
      const hits = finder.findAll();
      for (const cell of hits) {
        const r = cell.getRow();
        this.ingest(table, header, sh.getRange(r, 1, 1, header.length).getValues()[0], r);
      }
      this.partial.add(table);
      return;
    }
    const n = this.tail[table];
    if (n && lastRow > 1) {
      const start = Math.max(2, lastRow - n + 1);
      const values = sh.getRange(start, 1, lastRow - start + 1, header.length).getValues();
      values.forEach((cells, i) => this.ingest(table, header, cells, start + i));
      this.partial.add(table);
      return;
    }
    if (lastRow > 1) {
      const values = sh.getRange(2, 1, lastRow - 1, header.length).getValues();
      values.forEach((cells, i) => this.ingest(table, header, cells, i + 2));
    }
    this.loaded.add(table);
  }

  // Reads: load lazily.
  list(table) { this.ensureLoaded(table); return super.list(table); }
  get(table, id) {
    this.ensureLoaded(table);
    const hit = super.get(table, id);
    if (hit || this.loaded.has(table)) return hit;
    return this.fetchById(table, id); // partial load: look the id up directly
  }
  find(table, pred) { this.ensureLoaded(table); return super.find(table, pred); }
  findOne(table, pred) { this.ensureLoaded(table); return super.findOne(table, pred); }
  count(table, pred) { this.ensureLoaded(table); return super.count(table, pred); }
  update(table, id, patch) { this.ensureLoaded(table); if (!this.cache[table].has(String(id))) this.fetchById(table, id); return super.update(table, id, patch); }
  remove(table, id) { this.ensureLoaded(table); if (!this.cache[table].has(String(id))) this.fetchById(table, id); return super.remove(table, id); }

  insert(table, row) {
    if (APPEND_ONLY.has(table) && !this.loaded.has(table) && !this.partial.has(table)) {
      // write without reading the (potentially huge) log sheet
      this.header(table);
      const full = this.normalise(table, row);
      const idCol = TABLES[table].id;
      if (!full[idCol]) full[idCol] = `${table === 'AuditLogs' ? 'alog' : 'plog'}_${Date.now().toString(36)}${Utilities.getUuid().replace(/-/g, '').slice(0, 10)}`;
      this.persistInsert(table, full);
      return { ...full };
    }
    this.ensureLoaded(table);
    return super.insert(table, row);
  }

  /** Find one row by primary key with TextFinder (used when only part of a table is loaded). */
  fetchById(table, id) {
    const sh = this.sheet(table);
    const header = this.header(table);
    const lastRow = sh.getLastRow();
    if (lastRow < 2) return null;
    const col = header.indexOf(TABLES[table].id) + 1;
    const hit = sh.getRange(2, col, lastRow - 1, 1).createTextFinder(String(id)).matchEntireCell(true).matchCase(true).findNext();
    if (!hit) return null;
    const r = hit.getRow();
    this.ingest(table, header, sh.getRange(r, 1, 1, header.length).getValues()[0], r);
    const row = this.cache[table].get(String(id));
    return row ? { ...row } : null;
  }

  // Writes: immediate.
  persistInsert(table, row) {
    const sh = this.sheet(table);
    sh.appendRow(objectToRow(table, this.header(table), row));
    this.rowIndex[table].set(row[TABLES[table].id], sh.getLastRow());
  }

  persistUpdate(table, row) {
    const id = row[TABLES[table].id];
    const r = this.rowIndex[table].get(id);
    if (!r) return this.persistInsert(table, row);
    const header = this.header(table);
    this.sheet(table).getRange(r, 1, 1, header.length).setValues([objectToRow(table, header, row)]);
    return undefined;
  }

  persistRemove(table, row) {
    const id = row[TABLES[table].id];
    const r = this.rowIndex[table].get(id);
    if (!r) return;
    this.sheet(table).deleteRow(r);
    this.rowIndex[table].delete(id);
    for (const [k, v] of this.rowIndex[table]) if (v > r) this.rowIndex[table].set(k, v - 1);
  }

  flush() {}
  close() {}
}

let store = null;
export function createStore() {
  store = new SpreadsheetStore(SpreadsheetApp.getActiveSpreadsheet());
  return store;
}
export function getStore() {
  if (!store) createStore();
  return store;
}
export function setStore(s) { store = s; }
