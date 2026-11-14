const log = (kind, ...args) => { try { (kind === 'error' ? console.error : console.log)(`[${kind.toUpperCase()}]`, ...args.map((a) => (a instanceof Error ? a.message : a))); } catch { /* ignore */ } };
export const logger = { debug: () => {}, info: (...a) => log('info', ...a), warn: (...a) => log('warn', ...a), error: (...a) => log('error', ...a) };
