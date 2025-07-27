'use client';

import type React from 'react';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { cn } from '@/lib/utils';
import { Loader2Icon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../lib/axios';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

interface LoginData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data } = await API.post('/api/auth/login', {
        email: formData.email,
        password: formData.password,
      });

      setUser(data.user);
      navigate('/home');
    } catch (error) {
      logger.error('[handleSubmit]: ', error);

      let message = 'Network error. Please try again.';

      if (axios.isAxiosError(error)) {
        message = error.response?.data?.error || 'Wrong email or password';
      }

      setErrors({ general: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof LoginData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <Card className="w-full max-w-3xl sm:h-[500px] gap-0 p-0 flex flex-col sm:flex-row overflow-hidden sm:rounded-2xl sm:shadow-lg">
      {/* Left: Branding / Info */}
      <div className="bg-clinic-primary text-primary-foreground flex flex-col items-center justify-center p-8 text-center w-full sm:w-1/2">
        <h1 className="text-4xl font-bold mb-2">APC E-Cliniq</h1>
        <p className="text-base text-primary-foreground/80">
          Your gateway to the Online Clinic System
        </p>
      </div>

      {/* Right: Login Form */}
      <div className="bg-white p-6 sm:p-8 w-full sm:w-1/2 flex flex-col justify-center">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl text-foreground text-center">
            Sign In
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Enter your credentials below
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {errors.general && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                value={formData.email}
                onChange={handleInputChange('email')}
                className={cn(
                  errors.email && 'border-red-500 focus-visible:ring-red-500'
                )}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : undefined
                }
                value={formData.password}
                onChange={handleInputChange('password')}
                className={cn(
                  errors.password && 'border-red-500 focus-visible:ring-red-500'
                )}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <a
                href="/register"
                className="text-accent hover:underline font-medium"
              >
                Register here
              </a>
            </div>
          </form>
        </CardContent>
      </div>
    </Card>
  );
}
