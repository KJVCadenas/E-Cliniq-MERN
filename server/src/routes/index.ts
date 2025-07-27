import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import { requireAuth } from '../modules/auth/auth.middleware';
import { Request, Response } from 'express';

const router = Router();

router.use('/auth', authRoutes);

// 🔐 Protected test route
router.get(
  '/protected',
  requireAuth(['patient']),
  (req: Request, res: Response) => {
    res.status(200).json({
      message: 'You have accessed a protected route',
      user: req.user, // Added by requireAuth middleware
    });
  }
);

export default router;
