import { Request, Response } from 'express';
import {
  createProfileService,
  getProfileService,
  getOwnProfileService,
  updateProfileService,
} from './profile.service';
import { logger } from '@/utils/logger';

export const createProfileController = async (req: Request, res: Response) => {
  try {
    const profile = await createProfileService(req.user!.id, req.body);
    res.status(201).json({ message: 'Profile created', profile });
  } catch (err: any) {
    logger.error(err, req);
    if (err.errors) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
};

export const getOwnProfileController = async (req: Request, res: Response) => {
  try {
    const profile = await getOwnProfileService(req.user!.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json({ profile });
  } catch (err: any) {
    logger.error(err, req);
    res.status(500).json({ error: err.message });
  }
};

export const getProfileByIdController = async (req: Request, res: Response) => {
  try {
    const profile = await getProfileService(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json({ profile });
  } catch (err: any) {
    logger.error(err, req);
    res.status(500).json({ error: err.message });
  }
};

export const updateProfileByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const profile = await updateProfileService(req.params.id, req.body);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.status(200).json({ message: 'Profile updated', profile });
  } catch (err: any) {
    logger.error(err, req);
    if (err.errors) {
      return res.status(400).json({ error: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
};
