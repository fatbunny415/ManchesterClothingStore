import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Menu } from 'lucide-react';
import { useAdminStore } from '../../store/useAdminStore';
import UserAvatar from '../UserAvatar';
import { Link } from 'react-router-dom';

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/products': 'Productos',
  '/admin/orders': 'Pedidos',
  '/admin/users': 'Usuarios',
  '/admin/profile': 'Mi Perfil',
};

const AdminNavbar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const toggleSidebar = useAdminStore((s) => s.toggleSidebar);

  const currentPage = breadcrumbMap[location.pathname] || 'Admin';

  return (
    <header className="admin-navbar">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-white/60" />
        </button>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/30 font-medium">Admin</span>
          <span className="text-white/20">/</span>
          <span className="text-red-500 font-semibold">{currentPage}</span>
        </div>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white/90 leading-tight">
            {user?.fullName || 'Admin'}
          </p>
          <p className="text-[10px] text-red-500/80 font-bold tracking-widest uppercase">
            {user?.role || 'Administrador'}
          </p>
        </div>
        <Link to="/admin/profile" className="transition-transform hover:scale-105">
          <UserAvatar name={user?.fullName} role="Admin" size="md" />
        </Link>
      </div>
    </header>
  );
};

export default AdminNavbar;
