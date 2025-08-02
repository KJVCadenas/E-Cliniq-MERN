import { useState, useEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import API from '@/lib/axios';
import type { User } from '@/types/user';
import axios from 'axios';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      await API.post('api/auth/logout');
      setUser(null);
      navigate('/login');
      toast.success("You're now logged out. Come back anytime!");
    } catch (error) {
      logger.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    const publicRoutes = ['/login', '/register'];
    if (publicRoutes.includes(location.pathname)) {
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await API.get('/api/auth/me', { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setUser(null); // avoid logout
        } else {
          logger.error('[AuthProvider] Unexpected error:', error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [location.pathname]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
