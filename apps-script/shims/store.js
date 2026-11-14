/**
 * Google Sheets store for the Apps Script edition. Reads a worksheet the first
 * time it is needed in a request, writes every change straight to the sheet.
 * Apps Script executions are short-lived, so there is no long-running cache.
 */
import { BaseStore } from '../../server/src/data/store.js';
import { TABLES, rowToObject, objectToRow } from '../../server/src/data/schema.js';

export class SpreadsheetStore extends BaseStore {
  constructor(spreadsheet) {
    super();
    this.ss = spreadsheet;
    this.loaded = new Set();
    this.sheets = {};
    this.headers = {};
    this.rowIndex = {};
  }

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

  /** Create every worksheet with its header row (used by setup()). */
  ensureAll() {
    for (const t of Object.keys(TABLES)) this.ensureLoaded(t);
  }

  ensureLoaded(table) {
    this.assertTableName(table);
    if (this.loaded.has(table)) return;
    const sh = this.sheet(table);
    const def = TABLES[table];
    const values = sh.getLastRow() ? sh.getDataRange().getValues() : [];
    let header = (values[0] || []).map((h) => String(h || '').trim());
    const missing = def.columns.filter((c) => !header.includes(c));
    if (!header.filter(Boolean).length || missing.length) {
      header = [...header.filter(Boolean), ...missing];
      sh.getRange(1, 1, 1, header.length).setValues([header]);
      sh.getRange(1, 1, sh.getMaxRows(), header.length).setNumberFormat('@');
    }
    this.headers[table] = header;
    const idIdx = header.indexOf(def.id);
    const map = new Map();
    const index = new Map();
    for (let i = 1; i < values.length; i++) {
      const cells = values[i];
      const id = cells[idIdx];
      if (id === undefined || id === null || id === '') continue;
      map.set(String(id), rowToObject(table, header, cells));
      index.set(String(id), i + 1);
    }
    this.cache[table] = map;
    this.rowIndex[table] = index;
    this.loaded.add(table);
  }

  assertTableName(table) { if (!TABLES[table]) throw new Error(`Unknown table: ${table}`); }

  // Reads: load lazily.
  list(table) { this.ensureLoaded(table); return super.list(table); }
  get(table, id) { this.ensureLoaded(table); return super.get(table, id); }
  find(table, pred) { this.ensureLoaded(table); return super.find(table, pred); }
  findOne(table, pred) { this.ensureLoaded(table); return super.findOne(table, pred); }
  count(table, pred) { this.ensureLoaded(table); return super.count(table, pred); }
  insert(table, row) { this.ensureLoaded(table); return super.insert(table, row); }
  update(table, id, patch) { this.ensureLoaded(table); return super.update(table, id, patch); }
  remove(table, id) { this.ensureLoaded(table); return super.remove(table, id); }

  // Writes: immediate.
  persistInsert(table, row) {
    const sh = this.sheet(table);
    sh.appendRow(objectToRow(table, this.headers[table], row));
    this.rowIndex[table].set(row[TABLES[table].id], sh.getLastRow());
  }

  persistUpdate(table, row) {
    const id = row[TABLES[table].id];
    const r = this.rowIndex[table].get(id);
    if (!r) return this.persistInsert(table, row);
    const header = this.headers[table];
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
