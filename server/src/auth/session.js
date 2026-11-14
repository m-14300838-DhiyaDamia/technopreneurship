import { verifyToken } from './jwt.js';
import { getStore } from '../data/index.js';
import { unauthorized } from '../lib/errors.js';

/** Resolve the current user from a bearer token (shared by Express and Apps Script). */
export function resolveUser(token) {
  if (!token) throw unauthorized();
  let payload;
  try { payload = verifyToken(token); } catch { throw unauthorized('Your session has expired. Please login again.'); }
  const user = getStore().get('Users', payload.sub);
  if (!user || !user.active) throw unauthorized('Your account is not active');
  return { user_id: user.user_id, role: user.role, name: user.name, username: user.username, student_id: user.student_id || null, email: user.email };
}
