// auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || '';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    iat?: number;
    exp?: number;
  };
}

// Middleware factory: allows optional role restriction
export const requireAuth = (allowedRoles?: string[]) => {
  if (!allowedRoles || allowedRoles.length === 0) {
    throw new Error('requireAuth middleware must be called with allowed roles');
  }

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
      req.user = decoded;

      if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
        return res
          .status(403)
          .json({ error: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (err: any) {
      logger.error(`Token verification failed: ${err.message}`);
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };
};
