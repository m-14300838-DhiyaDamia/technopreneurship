/**
 * Google Apps Script edition — entry point.
 *
 * The web app receives every API call as a POST whose body is JSON:
 *   { method: "GET"|"POST"|…, path: "/lecturer/students?x=1", body: {...}, token: "…" }
 * and answers with JSON { status, body }. (Apps Script always answers HTTP 200,
 * so the real status code travels inside the envelope. The token travels in the
 * body because custom headers would trigger a CORS preflight Apps Script cannot answer.)
 *
 * Functions you can run from the Apps Script editor:
 *   setup()         — creates the worksheets and the first administrator account
 *   seedDemoData()  — fills an EMPTY spreadsheet with the DEMO groups/students/questions
 */
import { routes } from '../../server/src/api/routes.js';
import { matchRoute, checkAuth, validateBody } from '../../server/src/api/router.js';
import { resolveUser } from '../../server/src/auth/session.js';
import { audit } from '../../server/src/services/audit.js';
import { createUser } from '../../server/src/services/users.js';
import { seedDemo } from '../../server/src/demo/seed.js';
import { getStore, createStore } from '../../server/src/data/index.js';
import { ensureSecret } from '../../server/src/config.js';

const VERSION = '1.0.0';
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function json(status, body) {
  const out = ContentService.createTextOutput(JSON.stringify({ status, body }));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function parseRequest(e) {
  let req = {};
  try { req = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {}; } catch { return null; }
  const method = String(req.method || 'GET').toUpperCase();
  const full = String(req.path || '/');
  const [pathname, qs = ''] = full.split('?');
  const query = {};
  for (const part of qs.split('&')) {
    if (!part) continue;
    const [k, v = ''] = part.split('=');
    query[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, ' '));
  }
  return { method, pathname: pathname.replace(/\/+$/, '') || '/', query, body: req.body || {}, token: req.token || '' };
}

/**
 * Tell the store which rows this request needs, so large sheets are never read in full
 * for a single student. See SpreadsheetStore in shims/store.js.
 */
function applyScope(store, route, params, query, user) {
  const p = route.path;
  if (p.startsWith('/student/')) { store.setScope({ student_id: user.student_id }); return; }
  if (/^\/lecturer\/attempts\/:id\//.test(p) || p === '/lecturer/reports/individual/:attempt_id') {
    const attempt = store.fetchById('Attempts', params.id || params.attempt_id);
    if (attempt) store.setScope({ student_id: attempt.student_id });
    return;
  }
  if (params.group_id && (p.includes('/proposals/:group_id') || p.includes('/reports/group/'))) { store.setScope({ group_id: params.group_id }); return; }
  if (p === '/lecturer/assessments/:id/monitoring') { store.setScope({}, { ProctoringLogs: 400 }); return; }
  if (p === '/lecturer/monitoring/events') { if (query.student_id) store.setScope({ student_id: query.student_id }); else store.setScope({}, { ProctoringLogs: Math.min(Number(query.limit) || 500, 2000) }); return; }
  if (p === '/lecturer/dashboard') { store.setScope({}, { ProctoringLogs: 2000 }); return; }
  if (p === '/lecturer/audit' || p === '/admin/audit') { store.setScope({}, { AuditLogs: Math.min(Number(query.limit) || 500, 5000) }); }
}

/** Dispatch one API call. Exported for the test harness. */
export function handle(req) {
  const store = createStore(); // every request starts from the live spreadsheet (no stale cache)
  const match = matchRoute(routes, req.method, req.pathname);
  if (!match) return { status: 404, body: { error: 'API route not found' } };
  const { route, params } = match;
  try {
    let user = null;
    if (route.auth !== 'none') user = resolveUser(req.token);
    checkAuth(route, user);
    applyScope(store, route, params, req.query, user);
    const body = validateBody(route, req.body);
    const ctx = { user, params, query: req.query, body, ip: '', audit: (action, entityType, entityId, details) => audit(user, action, entityType, entityId, details, '') };
    const result = route.handler(ctx);
    if (result && result.__status) return { status: result.__status, body: result.body };
    return { status: 200, body: result };
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) console.error(err && err.stack ? err.stack : err);
    return { status, body: { error: status >= 500 ? `Internal error: ${err.message}` : err.message, details: err.details, code: err.details && err.details.code } };
  }
}

/** Student writes touch only that student's rows and are serialised by the student's own
 *  browser, so they run without the global lock. Staff/admin changes take the lock. */
function needsLock(req) {
  if (!MUTATING.has(req.method)) return false;
  return !req.pathname.startsWith('/student/');
}

export function doPost(e) {
  const req = parseRequest(e);
  if (!req) return json(400, { error: 'Invalid JSON request' });
  if (needsLock(req)) {
    const lock = LockService.getScriptLock();
    try { lock.waitLock(28000); } catch { return json(503, { error: 'The server is busy. Please try again in a moment.' }); }
    try { const res = handle(req); return json(res.status, res.body); } finally { lock.releaseLock(); }
  }
  const res = handle(req);
  return json(res.status, res.body);
}

export function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === 'meta') { const res = handle({ method: 'GET', pathname: '/meta', query: {}, body: {}, token: '' }); return json(res.status, res.body); }
  return json(200, { ok: true, edition: 'apps-script', version: VERSION, time: new Date().toISOString(), message: 'Technopreneurship Final Assessment API is running. Point the web application (config.json → apiUrl) at this URL.' });
}

/** Run once from the editor: creates worksheets, the token secret and the first admin. */
export function setup() {
  const store = createStore();
  store.ensureAll();
  ensureSecret();
  if (store.count('Users')) {
    console.log('Setup complete. Users already exist; no new administrator was created.');
    return 'Worksheets verified. Users already exist.';
  }
  const password = `Admin-${Utilities.getUuid().slice(0, 8)}`;
  createUser({ username: 'admin', password, role: 'admin', name: 'System Administrator', must_change_password: true });
  const msg = `Worksheets created. First administrator account → username: admin   password: ${password}   (change it at first login)`;
  console.log(msg);
  return msg;
}

/** Run from the editor on an EMPTY spreadsheet to load the fictional DEMO data. */
export function seedDemoData() {
  const store = createStore();
  store.ensureAll();
  ensureSecret();
  if (store.count('Users')) {
    const msg = 'The spreadsheet already contains users. Demo data is only seeded into an empty spreadsheet.';
    console.log(msg);
    return msg;
  }
  const lines = [];
  seedDemo(store, { withAnswers: true, log: (l) => lines.push(l) });
  console.log(lines.join('\n'));
  return lines.join('\n');
}
