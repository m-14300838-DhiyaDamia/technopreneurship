import { verifyToken } from './jwt.js';
import { getStore } from '../data/index.js';
import { unauthorized, forbidden } from '../lib/errors.js';

export const ROLES = ['student', 'lecturer', 'admin'];

export function extractToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}

/** Resolve the current user from the token; attaches req.user (fresh from the store). */
export function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) throw unauthorized();
    const payload = verifyToken(token);
    const user = getStore().get('Users', payload.sub);
    if (!user || !user.active) throw unauthorized('Your account is not active');
    req.user = {
      user_id: user.user_id, role: user.role, name: user.name, username: user.username,
      student_id: user.student_id || null, email: user.email,
    };
    next();
  } catch (err) {
    if (err.status) return next(err);
    next(unauthorized('Your session has expired. Please login again.'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}

/** Lecturers and administrators share most management screens. */
export const requireStaff = requireRole('lecturer', 'admin');
