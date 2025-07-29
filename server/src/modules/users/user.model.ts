import { Schema, model, Document, Types } from 'mongoose';

export interface UserDocument extends Document {
  _id: Types.ObjectId; // <-- Add this explicitly
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin';
}

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true, default: '' },
    lastName: { type: String, required: true, trim: true },
    suffix: { type: String, trim: true, default: '' },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'nurse', 'admin'],
      default: 'patient',
    },
  },
  { timestamps: true }
);

export const User = model<UserDocument>('User', userSchema);
