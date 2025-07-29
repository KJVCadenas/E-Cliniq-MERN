import type { ErrorRequestHandler } from 'express';
import { ZodError, treeifyError } from 'zod';
import mongoose from 'mongoose';
import { AppError } from '../types/AppError';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production';

  // Log full error stack — dev or prod
  logger.error(err, req);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let payload: Record<string, any> = { error: message };

  // === App-defined operational errors ===
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    payload.error = message;
  }

  // === Zod validation errors ===
  else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    payload = {
      error: message,
      issues: treeifyError(err),
    };
  }

  // === Mongoose errors ===
  else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
    payload.error = message;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => e.message);
    message = 'Invalid input data';
    payload = {
      error: message,
      issues: errors,
    };
  }

  // === JWT errors ===
  else if (
    err.name === 'JsonWebTokenError' ||
    err.name === 'TokenExpiredError'
  ) {
    statusCode = 401;
    message = 'Invalid or expired token';
    payload.error = message;
  }

  // === Fallback ===
  if (isProd && !(err instanceof AppError)) {
    // Mask unexpected error messages in production
    payload.error = 'Something went wrong';
    delete payload.issues; // remove if present
  }

  res.status(statusCode).json(payload);
};
