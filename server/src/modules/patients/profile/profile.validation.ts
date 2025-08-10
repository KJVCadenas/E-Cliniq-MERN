// src/validations/profile.validation.ts
import { z } from 'zod';

// ---------- Common Field Groups ----------
const requiredString = (msg: string) => z.string().min(1, msg);

const personalInfoSchema = {
  idNumber: requiredString('ID number is required'),
  dateOfBirth: z.coerce
    .date()
    .refine(
      date => !isNaN(date.getTime()),
      'Date of birth must be a valid date'
    ),
  sex: z.enum(['M', 'F', 'X'], { message: 'Sex must be one of: M, F, or X' }),
  civilStatus: requiredString('Civil status is required'),
  address: requiredString('Address is required'),
  telephone: z.string().optional(),
  mobile: requiredString('Mobile number is required'),
};

const emergencyContactSchema = {
  emergencyContactPerson: requiredString(
    'Emergency contact person is required'
  ),
  emergencyContactNumber: requiredString(
    'Emergency contact number is required'
  ),
  emergencyContactRelation: requiredString(
    'Emergency contact relation is required'
  ),
};

const baseProfileSchema = z.object({
  userType: z.enum(['student', 'employee'], {
    message: 'User type must be either "student" or "employee"',
  }),
  ...personalInfoSchema,
  ...emergencyContactSchema,
});

// ---------- Role-Specific Field Groups ----------
const studentFields = {
  courseSection: requiredString('Course section is required'),
  yearLevel: requiredString('Year level is required'),
  department: z.undefined(),
};

const employeeFields = {
  department: requiredString('Department is required'),
  courseSection: z.undefined(),
  yearLevel: z.undefined(),
};

// ---------- Create Schemas ----------
export const createProfileSchema = z.discriminatedUnion('userType', [
  baseProfileSchema.extend({
    userType: z.literal('student'),
    ...studentFields,
  }),
  baseProfileSchema.extend({
    userType: z.literal('employee'),
    ...employeeFields,
  }),
]);

// ---------- Update Schemas (All optional except userType) ----------
export const updateProfileSchema = z.discriminatedUnion('userType', [
  baseProfileSchema
    .extend({ userType: z.literal('student'), ...studentFields })
    .partial()
    .extend({ userType: z.literal('student') }),
  baseProfileSchema
    .extend({ userType: z.literal('employee'), ...employeeFields })
    .partial()
    .extend({ userType: z.literal('employee') }),
]);

// ---------- Types ----------
export type PatientProfileInput = z.infer<typeof createProfileSchema>;
