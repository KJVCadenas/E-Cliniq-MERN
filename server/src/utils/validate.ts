// src/utils/validate.ts
import { ZodType, ZodError, infer as zInfer } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validate<T extends ZodType>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const error = result.error as ZodError;
      return res.status(400).json({
        errors: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    req.body = result.data as zInfer<T>;
    next();
  };
}
