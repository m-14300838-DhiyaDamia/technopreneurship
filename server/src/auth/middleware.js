import { resolveUser } from './session.js';
import { unauthorized, forbidden } from '../lib/errors.js';

export const ROLES = ['student', 'lecturer', 'admin'];

export function extractToken(req) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return null;
}

export function requireAuth(req, _res, next) {
  try { req.user = resolveUser(extractToken(req)); next(); } catch (err) { next(err.status ? err : unauthorized()); }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (!roles.includes(req.user.role)) return next(forbidden());
    next();
  };
}

export const requireStaff = requireRole('lecturer', 'admin');
