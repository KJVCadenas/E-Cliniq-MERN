import { Router } from 'express';
import {
  loginHandler,
  logoutHandler,
  registerHandler,
  userDataHandler,
} from './auth.controller';

const router = Router();

router.post('/login', loginHandler);
router.post('/logout', logoutHandler);
router.post('/register', registerHandler);
router.get('/me', userDataHandler);

export default router;
