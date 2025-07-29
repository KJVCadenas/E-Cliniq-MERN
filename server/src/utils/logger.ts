import { Request } from 'express';

const sanitizeBody = (body: any) => {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };
  const redactedFields = ['password', 'confirmPassword'];

  for (const field of redactedFields) {
    if (field in clone) clone[field] = '[REDACTED]';
  }

  return clone;
};

const getErrorDetails = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
    };
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown error',
    stack: '',
  };
};

const _log = (
  level: 'INFO' | 'WARN' | 'ERROR',
  error: unknown,
  req?: Request
) => {
  const { message, stack } = getErrorDetails(error);
  const timestamp = new Date().toISOString();

  const logPayload: Record<string, any> = {
    timestamp,
    level,
    message,
    ...(stack ? { stack } : {}),
  };

  if (req) {
    logPayload.request = {
      method: req.method,
      url: req.originalUrl,
      params: req.params,
      query: req.query,
      body: sanitizeBody(req.body),
    };
  }

  console.log(JSON.stringify(logPayload, null, 2));
};

export const logger = {
  info: (error: unknown, req?: Request) => _log('INFO', error, req),
  warn: (error: unknown, req?: Request) => _log('WARN', error, req),
  error: (error: unknown, req?: Request) => _log('ERROR', error, req),
};
