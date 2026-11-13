import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { logger } from './lib/logger.js';
import authRoutes from './routes/auth.js';
import metaRoutes from './routes/meta.js';
import studentRoutes from './routes/student.js';
import lecturerRoutes from './routes/lecturer.js';
import adminRoutes from './routes/admin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        mediaSrc: ["'self'", 'blob:'],
        connectSrc: ["'self'", 'ws:', 'wss:', ...config.corsOrigins],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: config.isProd ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  }));
  app.use(cors({ origin: (origin, cb) => cb(null, !origin || config.corsOrigins.includes(origin)), credentials: false }));
  app.use(express.json({ limit: '2mb' }));

  app.use('/api', rateLimit({ windowMs: 60 * 1000, limit: config.isTest ? 100000 : 600, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests. Please slow down.' } }));
  app.use('/api', (req, _res, next) => { if (!req.is('json') && ['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-length'] > 0) return next({ status: 415, message: 'Requests must be JSON' }); next(); });

  app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
  app.use('/api/meta', metaRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/student', studentRoutes);
  app.use('/api/lecturer', lecturerRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found' }));

  // Serve the built frontend when present (single-host deployment).
  if (fs.existsSync(config.clientDistDir)) {
    app.use(express.static(config.clientDistDir, { maxAge: '1h', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(config.clientDistDir, 'index.html')));
  } else {
    app.get('/', (_req, res) => res.type('text').send('Technopreneurship Final Assessment API is running. Build the client (npm run build) to serve the web interface from this server.'));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    const status = err.status || (err.type === 'entity.parse.failed' ? 400 : 500);
    if (status >= 500) logger.error(err);
    res.status(status).json({ error: status >= 500 && config.isProd ? 'Internal server error' : err.message, details: err.details, code: err.details?.code });
  });
  return app;
}
