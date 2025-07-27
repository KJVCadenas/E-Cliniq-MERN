// src/utils/validate.ts
import { Request, Response, NextFunction } from 'express';
import { ZodObject, ZodRawShape, z } from 'zod';

export const validate =
  (schema: ZodObject<ZodRawShape>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      // Use z.flattenError() for flat error structure
      const flattened = z.flattenError(result.error);
      return res.status(400).json({
        errors: flattened.fieldErrors, // { fieldName: string[] }
      });
    }

    req.body = result.data;
    next();
  };
