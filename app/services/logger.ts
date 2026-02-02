type Level = 'debug' | 'info' | 'warn' | 'error';

export const logger = {
  debug: (...args: unknown[]) => log('debug', ...args),
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
};

function log(level: Level, ...args: unknown[]) {
  console[level](...args);
}
