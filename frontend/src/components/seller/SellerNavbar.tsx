import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Menu } from 'lucide-react';
import { useSellerStore } from '../../store/useSellerStore';
import UserAvatar from '../UserAvatar';
import { Link } from 'react-router-dom';

const breadcrumbMap: Record<string, string> = {
  '/seller': 'Panel',
  '/seller/orders': 'Pedidos',
  '/seller/stats': 'Ventas',
  '/seller/profile': 'Mi Perfil',
};

const SellerNavbar: React.FC = () => {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const toggleSidebar = useSellerStore((s) => s.toggleSidebar);

  const currentPage = breadcrumbMap[location.pathname] || 'Vendedor';

  return (
    <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-white/[0.04] bg-[#0a0a0a]/80 backdrop-blur-sm sticky top-0 z-40">
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
          <span className="text-white/30 font-medium">Vendedor</span>
          <span className="text-white/20">/</span>
          <span className="text-cyan-400 font-semibold">{currentPage}</span>
        </div>
      </div>

      {/* Right: User info */}
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white/90 leading-tight">
            {user?.fullName || 'Vendedor'}
          </p>
          <p className="text-[10px] text-cyan-400/80 font-bold tracking-widest uppercase">
            Vendedor
          </p>
        </div>
        <Link to="/seller/profile" className="transition-transform hover:scale-105">
          <UserAvatar name={user?.fullName} role="Vendedor" size="md" />
        </Link>
      </div>
    </header>
  );
};

export default SellerNavbar;
