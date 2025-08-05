// profile.validation.ts
import { z } from 'zod';

const baseProfileSchema = z.object({
  userType: z.enum(['student', 'employee'], {
    error: issue => 'User type must be either "student" or "employee"',
  }),
  idNumber: z.string({ error: () => 'ID number is required' }).min(1),

  dateOfBirth: z.coerce.date({
    error: issue =>
      issue.code === 'invalid_type'
        ? 'Date of birth must be a valid date'
        : 'Invalid date',
  }),

  sex: z.enum(['M', 'F', 'X'], {
    error: () => 'Sex must be one of: M, F, or X',
  }),

  civilStatus: z.string({ error: () => 'Civil status is required' }).min(1),
  address: z.string({ error: () => 'Address is required' }).min(1),
  telephone: z.string().optional(),
  mobile: z.string({ error: () => 'Mobile number is required' }).min(1),

  emergencyContactPerson: z
    .string({ error: () => 'Emergency contact person is required' })
    .min(1),
  emergencyContactNumber: z
    .string({ error: () => 'Emergency contact number is required' })
    .min(1),
  emergencyContactRelation: z
    .string({ error: () => 'Emergency contact relation is required' })
    .min(1),
});

// Discriminated union for student vs employee
export const patientProfileSchema = z.discriminatedUnion('userType', [
  baseProfileSchema.extend({
    userType: z.literal('student'),
    courseSection: z
      .string({ error: () => 'Course section is required' })
      .min(1),
    yearLevel: z.string({ error: () => 'Year level is required' }).min(1),
    department: z.undefined(),
  }),
  baseProfileSchema.extend({
    userType: z.literal('employee'),
    department: z.string({ error: () => 'Department is required' }).min(1),
    courseSection: z.undefined(),
    yearLevel: z.undefined(),
  }),
]);

export type PatientProfileInput = z.infer<typeof patientProfileSchema>;
