import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';
import { UserRole } from './auth.types';

const JWT_SECRET = process.env.JWT_SECRET || '';

export const requireAuth =
  (allowedRoles?: UserRole[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        role: UserRole;
      };

      // Prevent routes from being accidentally exposed if roles are undefined
      if (!allowedRoles) {
        return res
          .status(500)
          .json({ error: 'Access roles not defined for this route' });
      }

      if (!allowedRoles.includes(decoded.role)) {
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
