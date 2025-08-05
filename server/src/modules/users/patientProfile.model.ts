import { Schema, model, Types, Document } from 'mongoose';

export interface PatientProfileDocument extends Document {
  userId: Types.ObjectId;
  userType: 'student' | 'employee';
  idNumber: string;
  courseSection?: string;
  yearLevel?: string;
  department?: string;

  dateOfBirth: Date;
  sex: 'Male' | 'Female' | 'Other';
  civilStatus: string;
  address: string;
  telephone?: string;
  mobile: string;

  emergencyContactPerson: string;
  emergencyContactNumber: string;
  emergencyContactRelation: string;
}

const patientProfileSchema = new Schema<PatientProfileDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Enforce 1-to-1
    },
    userType: {
      type: String,
      enum: ['student', 'employee'],
      required: true,
    },
    idNumber: { type: String, required: true },

    courseSection: { type: String }, // student
    yearLevel: { type: String }, // student
    department: { type: String }, // employee

    dateOfBirth: { type: Date, required: true },
    sex: { type: String, enum: ['M', 'F', 'X'], required: true },
    civilStatus: { type: String, required: true },
    address: { type: String, required: true },
    telephone: { type: String, default: '' },
    mobile: { type: String, required: true },

    emergencyContactPerson: { type: String, required: true },
    emergencyContactNumber: { type: String, required: true },
    emergencyContactRelation: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ Virtual age (non-persistent)
patientProfileSchema.virtual('age').get(function (
  this: PatientProfileDocument
) {
  if (!this.dateOfBirth) return null;
  const dob = new Date(this.dateOfBirth);
  const ageDiffMs = Date.now() - dob.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

export const PatientProfile = model<PatientProfileDocument>(
  'PatientProfile',
  patientProfileSchema
);
