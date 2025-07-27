import { Schema, model, Document } from 'mongoose';

export interface UserDocument extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor' | 'nurse' | 'admin';
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
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
