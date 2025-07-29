export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Maintains stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}
