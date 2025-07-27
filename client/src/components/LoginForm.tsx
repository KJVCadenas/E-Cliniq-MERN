'use client';

import type React from 'react';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import env from '@/config/env';
import { logger } from '@/lib/logger';

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
      const response = await fetch(`${env.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', {
          token: data.token,
          user: data.user,
        });
        // Handle successful login (e.g., store token, redirect to dashboard)
      } else {
        setErrors({ general: data.message || 'Login failed' });
      }
    } catch (error) {
      logger.error('[handleSubmit]: ', error);
      setErrors({ general: 'Network error. Please try again.' });
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
    <Card className="w-full border-accent-yellow">
      <CardHeader className="bg-accent-yellow/10">
        <CardTitle className="text-center text-dark">Sign In</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              className={errors.email ? 'border-red-500' : ''}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-dark">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              className={errors.password ? 'border-red-500' : ''}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {"Don't have an account? "}
              <a
                href="/register"
                className="text-accent-yellow hover:underline font-medium"
              >
                Register here
              </a>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
