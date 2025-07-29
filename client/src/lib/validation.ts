// src/lib/validation.ts
import { z } from 'zod';

export const suffixOptions = [
  'N/A',
  'Jr.',
  'Sr.',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
] as const;

// Password strength regex: 12+ chars, uppercase, lowercase, number, special char
const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/;

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    middleName: z.string().trim().optional().or(z.literal('')),
    lastName: z.string().trim().min(1, 'Last name is required'),
    suffix: z.enum(suffixOptions, {
      message: 'Please select a valid suffix',
    }),
    email: z.email('Email is invalid').trim(),
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .regex(
        passwordRegex,
        'Password must include upper, lower, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
