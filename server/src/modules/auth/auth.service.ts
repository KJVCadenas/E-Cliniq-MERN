import bcrypt from 'bcryptjs';
import { User } from '../users/user.model';
import { RegisterInput, LoginInput } from './auth.types';
import { signToken, verifyToken } from '../../utils/jwt';
import { JwtPayload } from 'jsonwebtoken';

export const register = async (input: RegisterInput) => {
  const existingUser = await User.findOne({ email: input.email });
  if (existingUser) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    ...input,
    role: 'patient',
    password: hashedPassword,
  });

  return user;
};

export const login = async (input: LoginInput) => {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new Error('Invalid credentials');

  const isMatch = await bcrypt.compare(input.password, user.password);
  if (!isMatch) throw new Error('Invalid credentials');

  const token = signToken({ id: user._id, role: user.role });

  const { password, ...safeUser } = user.toObject();
  return { token, user: safeUser };
};

export const getMe = async (token: string) => {
  const payload = verifyToken(token);

  if (typeof payload === 'string' || !('id' in payload)) {
    throw new Error('Invalid token payload');
  }

  const user = await User.findById(payload.id).select('-password');
  if (!user) throw new Error('User not found');

  return user;
};
