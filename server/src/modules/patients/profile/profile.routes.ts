import { Router } from 'express';
import {
  getOwnProfileController,
  createProfileController,
  getProfileByIdController,
  updateProfileByIdController,
} from './profile.controller';
import { requireAuth } from '@/middlewares/requireAuth.middleware';
import { validate } from '@/utils/validate';
import { createProfileSchema, updateProfileSchema } from './profile.validation';

const router = Router();

// Get current Patient Profile
router.get('/me', requireAuth(['patient']), getOwnProfileController);

// Create a Patient Profile
router.post(
  '/profile',
  requireAuth(['patient']),
  validate(createProfileSchema),
  createProfileController
);

// Update parts of the existing Patient Profile
router.patch(
  '/profile/:id',
  requireAuth(['admin']),
  validate(updateProfileSchema),
  updateProfileByIdController
);

// Find a specific Patient Profile
router.get(
  '/profile/:id',
  requireAuth(['doctor', 'nurse', 'admin']),
  getProfileByIdController
);

export default router;
