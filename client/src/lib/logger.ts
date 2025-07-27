import env from '@/config/env';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';
type LogFn = (message: string, ...optionalParams: unknown[]) => void;

const isDev = env.clientEnv === 'development';

const createLoggerFn = (level: LogLevel): LogFn => {
  return (message, ...optionalParams) => {
    if (!isDev) return;

    const color = getColor(level);
    console[level](
      `%c[${level.toUpperCase()}] ${message}`,
      `color: ${color};`,
      ...optionalParams
    );
  };
};

const getColor = (level: LogLevel): string => {
  switch (level) {
    case 'log':
      return '#3a3a3a';
    case 'info':
      return '#35438c';
    case 'warn':
      return '#e7af41';
    case 'error':
      return '#e74c3c';
    case 'debug':
      return '#8e44ad';
    default:
      return '#000';
  }
};

export const logger = {
  log: createLoggerFn('log'),
  info: createLoggerFn('info'),
  warn: createLoggerFn('warn'),
  error: createLoggerFn('error'),
  debug: createLoggerFn('debug'),
};
