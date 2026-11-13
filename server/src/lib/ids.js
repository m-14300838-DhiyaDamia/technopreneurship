import crypto from 'node:crypto';

/** Short, URL-safe, prefixed unique id, e.g. "ans_8f3k2m9x1q". */
export function newId(prefix) {
  const rand = crypto.randomBytes(8).toString('base64url').replace(/[-_]/g, '').slice(0, 10).toLowerCase();
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowIso() {
  return new Date().toISOString();
}
