import { config } from '../config.js';
import { LocalJsonStore } from './localJsonStore.js';
import { SheetsStore } from './sheetsStore.js';
import { logger } from '../lib/logger.js';

/** @type {import('./store.js').BaseStore | null} */
let store = null;

export async function createStore(overrides = {}) {
  const kind = overrides.kind || config.dataStore;
  if (kind === 'sheets') {
    store = new SheetsStore({ ...config.sheets, ...overrides });
  } else if (kind === 'local') {
    store = new LocalJsonStore(overrides.dir || config.localDataDir);
  } else if (kind === 'memory') {
    const { LocalJsonStore: L } = await import('./localJsonStore.js');
    store = new L(overrides.dir || config.localDataDir);
    store.persistInsert = async () => {};
    store.persistUpdate = async () => {};
    store.persistRemove = async () => {};
    store.init = async () => {};
  } else {
    throw new Error(`Unknown DATA_STORE "${kind}" (use "sheets" or "local")`);
  }
  await store.init();
  logger.info(`Data store: ${kind}`);
  return store;
}

export function getStore() {
  if (!store) throw new Error('Store not initialised');
  return store;
}

export function setStore(s) {
  store = s;
}
