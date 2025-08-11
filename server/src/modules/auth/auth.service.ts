import bcrypt from 'bcryptjs';
import { User } from '../users/user.model';
import { RegisterInput, LoginInput } from './auth.types';
import { signToken, verifyToken } from '../../utils/jwt';
import axios from 'axios';

export const registerService = async (input: RegisterInput) => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) throw new Error('Email already registered');

  const isHuman = await validateCaptcha(input.recaptchaToken);
  if (!isHuman) throw new Error('Failed CAPTCHA verification');

  const hashedPassword = await bcrypt.hash(input.password, 10);

  const user = await User.create({
    firstName: input.firstName,
    middleName: input.middleName || '',
    lastName: input.lastName,
    suffix: input.suffix || '',
    email: input.email,
    password: hashedPassword,
    role: 'patient',
  });

  return user;
};

export const loginService = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = signToken({ sub: user._id.toString(), role: user.role });

  const { password, ...safeUser } = user.toObject();
  return { token, user: safeUser };
};

export const getMeService = async (id: string) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new Error('User not found');

  return user;
};

export const validateCaptcha = async (token: string) => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  const res = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify`,
    null,
    {
      params: {
        secret: secretKey,
        response: token,
      },
    }
  );

  return res.data.success;
};
