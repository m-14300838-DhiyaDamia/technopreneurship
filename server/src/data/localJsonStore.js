/**
 * Local JSON-file store. Used for development, demos and automated tests when
 * Google credentials are not configured. One JSON file per table.
 * Writes are debounced so rapid auto-saves do not hammer the disk.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { BaseStore } from './store.js';
import { TABLES } from './schema.js';
import { logger } from '../lib/logger.js';

export class LocalJsonStore extends BaseStore {
  constructor(dir, { debounceMs = 150 } = {}) {
    super();
    this.dir = dir;
    this.debounceMs = debounceMs;
    this.dirty = new Set();
    this.timer = null;
    this.chain = Promise.resolve(); // serialises disk writes
  }

  file(table) {
    return path.join(this.dir, `${table}.json`);
  }

  async init() {
    await fs.mkdir(this.dir, { recursive: true });
    for (const table of Object.keys(TABLES)) {
      try {
        const raw = await fs.readFile(this.file(table), 'utf8');
        const rows = JSON.parse(raw);
        const idCol = TABLES[table].id;
        for (const r of rows) this.cache[table].set(String(r[idCol]), this.normalise(table, r));
      } catch (err) {
        if (err.code !== 'ENOENT') logger.warn(`Could not read ${table}.json, starting empty:`, err.message);
      }
    }
    logger.info(`Local JSON store ready at ${this.dir}`);
  }

  schedule(table) {
    this.dirty.add(table);
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      this.enqueueWrite();
    }, this.debounceMs);
  }

  enqueueWrite() {
    this.chain = this.chain.then(() => this.writeDirty()).catch((err) => logger.error('Local store write failed:', err.message));
    return this.chain;
  }

  async writeDirty() {
    const tables = Array.from(this.dirty);
    this.dirty.clear();
    await Promise.all(
      tables.map(async (table) => {
        const rows = Array.from(this.cache[table].values());
        const tmp = `${this.file(table)}.tmp`;
        await fs.writeFile(tmp, JSON.stringify(rows, null, 2));
        await fs.rename(tmp, this.file(table));
      }),
    );
  }

  async persistInsert(table) { this.schedule(table); }
  async persistUpdate(table) { this.schedule(table); }
  async persistRemove(table) { this.schedule(table); }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.dirty.size) this.enqueueWrite();
    await this.chain;
  }

  async close() {
    await this.flush();
  }
}
