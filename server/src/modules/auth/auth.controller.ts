import { Request, Response } from 'express';
import { registerService, loginService, getMeService } from './auth.service';
import { logger } from '../../utils/logger';

export const registerController = async (req: Request, res: Response) => {
  try {
    const user = await registerService(req.body);
    res.status(201).json({ message: 'User registered', user });
  } catch (err: any) {
    logger.error(err, req);
    res.status(400).json({ error: err.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { token, user } = await loginService(req.body);

    // Set secure, HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // only true on HTTPS
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({ user });
  } catch (err: any) {
    logger.error(err, req);
    res.status(401).json({ error: err.message });
  }
};

export const logoutController = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};

export const userDataController = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const user = await getMeService(id);
    res.status(200).json({ user });
  } catch (err: any) {
    logger.error(err, req);
    res.status(401).json({ error: 'Invalid token' });
  }
};
