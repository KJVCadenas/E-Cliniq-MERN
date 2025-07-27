import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';
import { UserRole } from './auth.types';

const JWT_SECRET = process.env.JWT_SECRET || '';

export const requireAuth =
  (allowedRoles?: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.token; // 👈 read from cookie instead

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: UserRole;
      };

      if (allowedRoles && !allowedRoles.includes(decoded.role)) {
        return res
          .status(403)
          .json({ error: 'Forbidden: This role does not have access' });
      }

      req.user = decoded;
      next();
    } catch (err: any) {
      logger.error(`Token verification failed: ${err.message}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
