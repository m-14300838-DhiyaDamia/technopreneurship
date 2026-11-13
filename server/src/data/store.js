/**
 * Common data-store contract. Both adapters (LocalJsonStore, SheetsStore) implement:
 *
 *   await store.init()
 *   store.list(table)                 -> array of row objects (copies)
 *   store.get(table, id)              -> row object or null
 *   store.find(table, predicateFn)    -> array
 *   store.findOne(table, predicateFn) -> row or null
 *   await store.insert(table, row)    -> inserted row (id generated if missing)
 *   await store.update(table, id, patch) -> updated row
 *   await store.remove(table, id)     -> true/false
 *   await store.flush()               -> wait for pending writes to persist
 *   await store.close()
 *
 * Reads are served from an in-memory cache so the application never blocks on
 * Google Sheets for a page load. Writes are queued and batched by the adapter.
 */
import { TABLES } from './schema.js';
import { newId } from '../lib/ids.js';

const PREFIX = {
  Users: 'usr', Students: 'stu', Groups: 'grp', Assessments: 'asm', Questions: 'q', Attempts: 'att',
  Answers: 'ans', ProctoringLogs: 'plog', BusinessProposals: 'prop', GroupReports: 'rep', AuditLogs: 'alog', Settings: 'set',
};

export class BaseStore {
  constructor() {
    /** @type {Record<string, Map<string, object>>} */
    this.cache = {};
    for (const t of Object.keys(TABLES)) this.cache[t] = new Map();
  }

  assertTable(table) {
    if (!TABLES[table]) throw new Error(`Unknown table: ${table}`);
  }

  idColumn(table) {
    return TABLES[table].id;
  }

  normalise(table, row) {
    const def = TABLES[table];
    const out = {};
    for (const col of def.columns) {
      const t = def.types[col];
      let v = row[col];
      if (v === undefined) v = t === 'boolean' ? false : t === 'json' || t === 'number' ? null : '';
      out[col] = v;
    }
    return out;
  }

  list(table) {
    this.assertTable(table);
    return Array.from(this.cache[table].values()).map((r) => ({ ...r }));
  }

  get(table, id) {
    this.assertTable(table);
    const r = this.cache[table].get(String(id));
    return r ? { ...r } : null;
  }

  find(table, pred) {
    return this.list(table).filter(pred);
  }

  findOne(table, pred) {
    for (const r of this.cache[table].values()) if (pred(r)) return { ...r };
    return null;
  }

  count(table, pred) {
    let n = 0;
    for (const r of this.cache[table].values()) if (!pred || pred(r)) n++;
    return n;
  }

  async insert(table, row) {
    this.assertTable(table);
    const idCol = this.idColumn(table);
    const full = this.normalise(table, row);
    if (!full[idCol]) full[idCol] = newId(PREFIX[table] || 'row');
    if (this.cache[table].has(full[idCol])) throw new Error(`Duplicate ${idCol} in ${table}: ${full[idCol]}`);
    this.cache[table].set(full[idCol], full);
    await this.persistInsert(table, full);
    return { ...full };
  }

  async update(table, id, patch) {
    this.assertTable(table);
    const existing = this.cache[table].get(String(id));
    if (!existing) throw new Error(`${table} row not found: ${id}`);
    const idCol = this.idColumn(table);
    const next = this.normalise(table, { ...existing, ...patch, [idCol]: existing[idCol] });
    this.cache[table].set(existing[idCol], next);
    await this.persistUpdate(table, next);
    return { ...next };
  }

  async remove(table, id) {
    this.assertTable(table);
    const existing = this.cache[table].get(String(id));
    if (!existing) return false;
    this.cache[table].delete(String(id));
    await this.persistRemove(table, existing);
    return true;
  }

  // Adapters override these.
  async init() {}
  async persistInsert() {}
  async persistUpdate() {}
  async persistRemove() {}
  async flush() {}
  async close() {}
}
