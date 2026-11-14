/**
 * Framework-neutral route table helpers. A route is:
 *   { method, path, auth, schema?, rateLimit?, handler(ctx) -> body | created(body) }
 * where auth is 'none' | 'any' | [roles…] and ctx is
 *   { user, params, query, body, ip, audit(action, entityType, entityId, details) }.
 * Express mounts these in src/api/express.js; the Google Apps Script edition
 * dispatches them from apps-script/src/main.js.
 */
import { badRequest, forbidden, unauthorized } from '../lib/errors.js';

export const STAFF = ['lecturer', 'admin'];
export const created = (body) => ({ __status: 201, body });

export function compilePath(path) {
  const keys = [];
  const re = new RegExp(`^${path.replace(/\/:(\w+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; })}/?$`);
  return { re, keys };
}

export function matchRoute(routes, method, pathname) {
  for (const r of routes) {
    if (r.method !== method) continue;
    r._c = r._c || compilePath(r.path);
    const m = r._c.re.exec(pathname);
    if (!m) continue;
    const params = {};
    r._c.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
    return { route: r, params };
  }
  return null;
}

export function checkAuth(route, user) {
  if (route.auth === 'none') return;
  if (!user) throw unauthorized();
  if (Array.isArray(route.auth) && !route.auth.includes(user.role)) throw forbidden();
}

export function validateBody(route, body) {
  if (!route.schema) return body;
  const result = route.schema.safeParse(body ?? {});
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`);
    throw badRequest(issues[0] || 'Invalid request', issues);
  }
  return result.data;
}
