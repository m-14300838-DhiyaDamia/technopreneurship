import { badRequest } from './errors.js';

/** Wrap async route handlers so rejected promises reach the error middleware. */
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/** Validate req.body (or query) against a zod schema; replaces it with the parsed value. */
export const validate = (schema, where = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[where]);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.') || where}: ${i.message}`);
    return next(badRequest(issues[0] || 'Invalid request', issues));
  }
  req[where] = result.data;
  next();
};
