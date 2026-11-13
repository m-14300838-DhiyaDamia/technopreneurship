const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'error' : 'info');
const order = { debug: 10, info: 20, warn: 30, error: 40 };
function log(kind, ...args) {
  if (order[kind] < order[level]) return;
  const ts = new Date().toISOString();
  // eslint-disable-next-line no-console
  (kind === 'error' ? console.error : console.log)(`[${ts}] ${kind.toUpperCase()}`, ...args);
}
export const logger = {
  debug: (...a) => log('debug', ...a),
  info: (...a) => log('info', ...a),
  warn: (...a) => log('warn', ...a),
  error: (...a) => log('error', ...a),
};
