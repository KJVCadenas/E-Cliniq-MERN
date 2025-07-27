// src/modules/auth/auth.validation.ts

import { z } from 'zod';

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .max(50, 'First name is too long'),

    middleName: z
      .string()
      .max(50, 'Middle name is too long')
      .optional()
      .or(z.literal('')),

    lastName: z
      .string()
      .min(1, 'Last name is required')
      .max(50, 'Last name is too long'),

    suffix: z
      .string()
      .max(10, 'Suffix is too long')
      .optional()
      .or(z.literal('')),

    email: z.string().email('Invalid email address'),

    password: z.string().min(6, 'Password must be at least 6 characters long'),

    confirmPassword: z
      .string()
      .min(6, 'Confirm Password must be at least 6 characters long'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
