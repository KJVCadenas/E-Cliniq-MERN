'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  suffixOptions,
  type RegisterSchema,
} from '@/lib/validation';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { logger } from '@/lib/logger';
import ReCAPTCHA from 'react-google-recaptcha';
import env from '@/config/env';
import API from '@/lib/axios';

export function RegisterForm() {
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterSchema) => {
    setServerError('');
    try {
      await API.post('/api/auth/register', {
        firstName: data.firstName,
        middleName: data.middleName,
        lastName: data.lastName,
        suffix: data.suffix === 'N/A' ? '' : data.suffix,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        recaptchaToken: captchaToken,
      });

      toast.success('Registration successful! Redirecting to login…');
      navigate('/login');
    } catch (error: unknown) {
      logger.error('[onSubmit]: ', error);

      let message = 'Registration failed. Please try again.';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || 'Wrong email or password';
      } else if (error instanceof Error) {
        message = error.message;
      }

      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto p-6 rounded-2xl shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-center">
          Create an Account
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                autoComplete="given-name"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                {...register('middleName')}
                autoComplete="additional-name"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                autoComplete="family-name"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="suffix">Suffix</Label>
              <Select
                onValueChange={value =>
                  setValue('suffix', value as RegisterSchema['suffix'])
                }
                defaultValue=""
              >
                <SelectTrigger id="suffix" className="w-full">
                  <SelectValue placeholder="-- Select suffix --" />
                </SelectTrigger>
                <SelectContent>
                  {suffixOptions.map(suffix => (
                    <SelectItem key={suffix} value={suffix}>
                      {suffix}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.suffix && (
                <p className="text-sm text-red-500">{errors.suffix.message}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-600">{serverError}</p>}

          {/* Verify If Hooman */}
          <div className="w-full flex justify-center">
            <ReCAPTCHA
              sitekey={env.recaptchaSiteKey}
              onChange={token => setCaptchaToken(token)}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Registering…' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
