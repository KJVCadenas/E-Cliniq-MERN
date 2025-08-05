import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import profileRoutes from '../modules/patients/profile/profile.routes';
import { requireAuth } from '../middlewares/requireAuth.middleware';
import { Request, Response } from 'express';

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', profileRoutes);

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
