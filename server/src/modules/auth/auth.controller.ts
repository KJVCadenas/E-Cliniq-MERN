import { Request, Response } from 'express';
import { register, login } from './auth.service';
import { logger } from '../../utils/logger';

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const user = await register(req.body);
    res.status(201).json({ message: 'User registered', user });
  } catch (err: any) {
    logger.error(err.message);
    res.status(400).json({ error: err.message });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { token, user } = await login(req.body);
    res.status(200).json({ token, user });
  } catch (err: any) {
    logger.error(err.message);
    res.status(401).json({ error: err.message });
  }
};
