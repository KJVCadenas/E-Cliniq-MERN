import { Router } from 'express';
import {
  getOwnProfile,
  createProfile,
  getProfileById,
  updateProfileById,
} from './profile.controller';
import { requireAuth } from '@/middlewares/requireAuth.middleware';
import { validate } from '@/utils/validate';
import { createProfileSchema, updateProfileSchema } from './profile.validation';

const router = Router();

/**
 * GET /patients/profile/me
 * Patient retrieves their own profile
 * Roles: "patient"
 */
router.get('/me', requireAuth(['patient']), getOwnProfile);

/**
 * POST /patients/profile
 * Patient creates their own profile
 * Roles: "patient"
 */
router.post(
  '/',
  requireAuth(['patient']),
  validate(createProfileSchema),
  createProfile
);

/**
 * GET /patients/profile/:id
 * Get any patient's profile by ID
 * Roles: "doctor", "nurse", "admin"
 */
router.get('/:id', requireAuth(['doctor', 'nurse', 'admin']), getProfileById);

/**
 * PATCH /patients/profile/:id
 * Admin updates a profile by ID
 * Roles: "admin"
 */
router.patch(
  '/:id',
  requireAuth(['admin']),
  validate(updateProfileSchema),
  updateProfileById
);

export default router;
