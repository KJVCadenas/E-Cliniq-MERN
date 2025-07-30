import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import PatientHomePage from './Patient/PatientHome';

export default function Home() {
  const { user, logout } = useAuth();

  const homeContent = () => {
    switch (user?.role) {
      case 'patient':
        return <PatientHomePage />;
      default:
        return (
          <div>
            <p>Welcome</p>
            <Button onClick={logout}>Log out</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-200 flex items-center justify-center">
      {homeContent()}
    </div>
  );
}
