import { Request, Response } from 'express';
import { register, login, getMe } from './auth.service';
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

    // Set secure, HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only true on HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ user });
  } catch (err: any) {
    logger.error(err.message);
    res.status(401).json({ error: err.message });
  }
};

export const logoutHandler = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

export const userDataHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const user = await getMe(id);
    res.status(200).json({ user });
  } catch (err: any) {
    console.log(err);
    res.status(401).json({ error: 'Invalid token' });
  }
};
