import http from 'node:http';
import { config } from './config.js';
import { createStore } from './data/index.js';
import { createApp } from './app.js';
import { initRealtime } from './realtime/index.js';
import { sweepExpiredAttempts } from './services/attempts.js';
import { logger } from './lib/logger.js';
import { ensureBootstrapAdmin } from './services/bootstrap.js';

async function main() {
  const store = await createStore();
  await ensureBootstrapAdmin();
  const app = createApp();
  const server = http.createServer(app);
  initRealtime(server, config.corsOrigins);

  const sweep = setInterval(() => sweepExpiredAttempts().catch((e) => logger.error('sweep failed', e.message)), 15000);
  sweep.unref();

  server.listen(config.port, () => logger.info(`Server listening on http://localhost:${config.port} (${config.env}, store=${config.dataStore})`));

  const shutdown = async (signal) => {
    logger.info(`${signal} received: flushing pending writes…`);
    clearInterval(sweep);
    server.close();
    try { await store.close(); } catch (e) { logger.error('flush on shutdown failed', e.message); }
    process.exit(0);
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  logger.error('Fatal start-up error:', err.message);
  if (!config.isProd) logger.error(err.stack);
  process.exit(1);
});
