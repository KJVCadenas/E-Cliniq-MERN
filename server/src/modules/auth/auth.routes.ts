import { Router } from 'express';
import {
  loginController,
  logoutController,
  registerController,
  userDataController,
} from './auth.controller';
import { requireAuth } from '../../middlewares/requireAuth.middleware';
import { registerSchema } from './auth.validation';
import { validate } from '../../utils/validate';

const router = Router();

router.post('/login', loginController);
router.post('/logout', logoutController);
router.post('/register', validate(registerSchema), registerController);
router.get(
  '/me',
  requireAuth(['patient', 'doctor', 'nurse', 'admin']),
  userDataController
);

export default router;
