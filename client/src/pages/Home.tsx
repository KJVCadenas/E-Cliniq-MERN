import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center">
      <p>Welcome</p>
      <Button onClick={logout}>Log out</Button>
    </div>
  );
}
