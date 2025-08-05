import * as AuthService from '../auth.service';
import * as jwtUtil from '@/utils/jwt';
import { User } from '@/modules/users/user.model';
import bcrypt from 'bcryptjs';
import axios from 'axios';

jest.mock('@/modules/users/user.model');
jest.mock('bcryptjs');
jest.mock('axios');
jest.mock('@/utils/jwt');

const mockUser = {
  _id: 'user123',
  email: 'test@example.com',
  password: 'hashedpw',
  role: 'patient',
  toObject: () => ({
    _id: 'user123',
    email: 'test@example.com',
    role: 'patient',
  }),
};

describe('AuthService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should register new user successfully', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpw');
      (User.create as jest.Mock).mockResolvedValue(mockUser);

      const input = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'pw123456',
        recaptchaToken: 'recaptcha',
      };

      const result = await AuthService.register(input);
      expect(User.findOne).toHaveBeenCalledWith({ email: input.email });
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should throw if email already exists', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const input = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'pw123456',
        recaptchaToken: 'test-token',
      };

      await expect(AuthService.register(input)).rejects.toThrow(
        'Email already registered'
      );
    });

    it('should throw if CAPTCHA fails', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: false } });

      await expect(
        AuthService.register({
          firstName: 'A',
          lastName: 'B',
          email: 'fail@test.com',
          password: '123',
          recaptchaToken: 'bad',
        })
      ).rejects.toThrow('Failed CAPTCHA verification');
    });
  });

  describe('login', () => {
    it('should login and return token and user', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwtUtil.signToken as jest.Mock).mockReturnValue('signed.jwt.token');

      const result = await AuthService.login({
        email: 'test@example.com',
        password: 'pw123',
      });

      expect(result.token).toBe('signed.jwt.token');
      expect(result.user).toMatchObject({
        _id: 'user123',
        email: 'test@example.com',
        role: 'patient',
      });
    });

    it('should throw on invalid password', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw if user not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.login({ email: 'missing@example.com', password: 'pw' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('getMe', () => {
    it('should return user data without password', async () => {
      (User.findById as jest.Mock).mockImplementationOnce(() => ({
        select: jest.fn().mockResolvedValueOnce(mockUser),
      }));

      const result = await AuthService.getMe('user123');
      expect(result).toEqual(mockUser);
    });

    it('should throw if user not found', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: () => null,
      });

      await expect(AuthService.getMe('fake-id')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('validateCaptcha', () => {
    it('should return true for valid captcha', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: true } });
      const result = await AuthService.validateCaptcha('token');
      expect(result).toBe(true);
    });

    it('should return false for failed captcha', async () => {
      (axios.post as jest.Mock).mockResolvedValue({ data: { success: false } });
      const result = await AuthService.validateCaptcha('bad-token');
      expect(result).toBe(false);
    });
  });
});
