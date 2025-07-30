import { HomeIcon, Power } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}

export function Sidebar() {
  const { logout } = useAuth();

  const navItems: NavItem[] = [
    {
      id: 'home',
      icon: HomeIcon,
      label: 'Home',
    },
    {
      id: 'logout',
      icon: Power,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <aside
      className="fixed top-0 left-0 z-20 h-screen bg-primary text-white w-[60px] hover:w-[240px] transition-all duration-300 ease-in-out overflow-hidden group"
      aria-label="Main navigation"
    >
      <nav className="flex flex-col gap-2 p-2 pt-2">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className="flex items-center w-full text-left transition-colors duration-200 hover:bg-primary-foreground/10 rounded-md p-2"
              aria-label={item.label}
            >
              <div className="flex items-center gap-4">
                <Icon className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap text-white transition-all duration-300 ease-in-out opacity-0 group-hover:opacity-100 min-w-0">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
