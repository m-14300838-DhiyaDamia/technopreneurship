import rateLimit from 'express-rate-limit';
import { config } from '../config.js';
import { requireAuth, requireRole } from '../auth/middleware.js';
import { wrap, validate } from '../lib/http.js';
import { audit } from '../services/audit.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: config.isTest ? 1000 : 20, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 15 minutes and try again.' },
});

/** Mount the shared route table on an Express app under /api. */
export function mountRoutes(app, routes) {
  for (const route of routes) {
    const chain = [];
    if (route.rateLimit === 'login') chain.push(loginLimiter);
    if (route.auth !== 'none') chain.push(requireAuth);
    if (Array.isArray(route.auth)) chain.push(requireRole(...route.auth));
    if (route.schema) chain.push(validate(route.schema));
    chain.push(wrap(async (req, res) => {
      const ctx = {
        user: req.user || null, params: req.params, query: req.query, body: req.body, ip: req.ip,
        audit: (action, entityType, entityId, details) => audit(req.user, action, entityType, entityId, details, req.ip),
      };
      const result = await route.handler(ctx);
      if (result && result.__status) res.status(result.__status).json(result.body);
      else res.json(result);
    }));
    app[route.method.toLowerCase()](`/api${route.path}`, ...chain);
  }
}
