'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerSchema,
  suffixOptions,
  type RegisterSchema,
} from '@/lib/validation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';

import ReCAPTCHA from 'react-google-recaptcha';
import env from '@/config/env';
import API from '@/lib/axios';
import { logger } from '@/lib/logger';
import zxcvbn from 'zxcvbn';
import { sanitizeFormData } from '@/lib/sanitizer';

export function RegisterForm() {
  const [serverError, setServerError] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const password = form.watch('password');
  const passwordScore = password ? zxcvbn(password).score : 0;
  const passwordProgress = (passwordScore / 4) * 100;

  useEffect(() => {
    toast.success('This is a success toast');
    toast.error('This is a error toast');
    toast.info('This is an info toast');
    toast.message('This is a message toast');
  }, []);

  const onSubmit = async (data: RegisterSchema) => {
    setServerError('');
    try {
      // Sanitize form data before sending to server
      const sanitizedData = sanitizeFormData({
        ...data,
        suffix: data.suffix === 'N/A' ? '' : data.suffix,
        recaptchaToken: captchaToken,
      });

      await API.post('/api/auth/register', sanitizedData);

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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="given-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="additional-name" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="family-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="suffix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Suffix</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue="">
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- Select suffix --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {suffixOptions.map(suffix => (
                          <SelectItem key={suffix} value={suffix}>
                            {suffix}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password with strength meter */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="new-password"
                        />
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      onOpenAutoFocus={e => e.preventDefault()}
                      side="top"
                      className="w-[300px]"
                    >
                      <p className="text-sm mb-2">Password strength:</p>
                      <Progress value={passwordProgress} className="h-2" />
                      <p className="text-xs mt-2">
                        Must be 12+ chars and include upper, lower, number,
                        symbol.
                      </p>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA
                sitekey={env.recaptchaSiteKey}
                onChange={token => setCaptchaToken(token)}
              />
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-red-600">{serverError}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || !captchaToken}
              className="w-full"
            >
              {form.formState.isSubmitting ? 'Registering…' : 'Register'}
            </Button>

            {/* Link to login */}
            <div className="text-center mt-4">
              <span className="text-sm text-gray-600">
                Already have an account?{' '}
              </span>
              <Button
                variant="link"
                onClick={() => navigate('/login')}
                className="text-sm p-0 font-medium text-clinic-yellow-dark"
              >
                Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
