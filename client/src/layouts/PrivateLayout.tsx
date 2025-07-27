// src/layouts/PrivateLayout.tsx
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from '@/components/SideBar';

export default function PrivateLayout() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen">
      <Sidebar userRole={user.role} />
      <main className="pl-[60px] transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
}
