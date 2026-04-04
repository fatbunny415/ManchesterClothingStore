import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSellerStore } from '../../store/useSellerStore';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/seller', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/seller/orders', label: 'Pedidos', icon: ShoppingCart, end: false },
  { to: '/seller/stats', label: 'Ventas', icon: BarChart3, end: false },
  { to: '/seller/profile', label: 'Mi Perfil', icon: UserCircle, end: false },
];

const SellerSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useSellerStore();
  const { logout, user } = useAuthStore();
  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-[#0f0f0f] border-r border-white/[0.04] flex flex-col z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      } max-lg:${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-white/[0.04] px-5">
        <AnimatePresence mode="wait">
          {!sidebarCollapsed ? (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <span className="text-lg font-serif font-bold tracking-tight text-white">
                VENTAS
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-lg font-serif font-bold text-cyan-400">V</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.end
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 hover:text-white/80 hover:bg-white/[0.03] ${
                  isActive ? 'text-cyan-400 bg-cyan-400/[0.06]' : 'text-white/40'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="seller-nav-indicator"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/[0.04] space-y-2">
        <button
          onClick={async () => {
            try {
              await api.post('/auth/logout');
            } catch (e) {
              console.error(e);
            }
            logout();
            window.location.href = '/login';
          }}
          className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/40 transition-all duration-200 hover:text-red-400 hover:bg-white/[0.03] w-full"
          title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Cerrar sesión</span>
          )}
        </button>

        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center p-2 rounded-xl text-white/20 hover:text-white/50 hover:bg-white/[0.03] transition-all duration-200"
          title={sidebarCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default SellerSidebar;
