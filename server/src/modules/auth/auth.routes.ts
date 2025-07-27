import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  userDataHandler,
} from './auth.controller';
import { requireAuth } from './auth.middleware';
import { registerSchema } from './auth.validation';
import { validate } from '../../utils/validate';

const router = Router();

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/register', validate(registerSchema), registerHandler);
router.get('/me', requireAuth(), userDataHandler);

export default router;
