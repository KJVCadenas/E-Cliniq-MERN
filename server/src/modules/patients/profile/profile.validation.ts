import { z } from 'zod';

export const createProfileSchema = z.object({
  firstName: z.string().min(1),
  middleName: z.string().optional(),
  lastName: z.string().min(1),
  suffix: z.string().optional(),
  sex: z.enum(['male', 'female', 'other']),
  birthDate: z.string().refine(date => !isNaN(Date.parse(date)), {
    message: 'Invalid date format',
  }),
  contactNumber: z.string().min(7).max(15),
  address: z.string().min(5),
});

export const updateProfileSchema = createProfileSchema.partial(); // all fields optional
