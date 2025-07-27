import { HomeIcon } from 'lucide-react';
import type { UserRoles } from '@/types/user';

interface SidebarProps {
  userRole?: UserRoles;
}

export function Sidebar({ userRole }: SidebarProps) {
  return (
    <aside className="fixed top-0 left-0 z-20 h-screen bg-primary text-white w-[60px] hover:w-[240px] transition-all duration-300 ease-in-out overflow-hidden">
      <nav className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-4">
          <HomeIcon className="w-5 h-5 shrink-0" />
          <span className="whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity duration-300">
            Home
          </span>
        </div>
        {/* Add role-based nav items here */}
      </nav>
    </aside>
  );
}
