import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminStore } from '../../store/useAdminStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  UserCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true, adminOnly: false },
  { to: '/admin/products', label: 'Productos', icon: Package, end: false, adminOnly: false },
  { to: '/admin/orders', label: 'Pedidos', icon: ShoppingCart, end: false, adminOnly: false },
  { to: '/admin/users', label: 'Usuarios', icon: Users, end: false, adminOnly: true },
  { to: '/admin/profile', label: 'Mi Perfil', icon: UserCircle, end: false, adminOnly: false },
];

const AdminSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useAdminStore();
  const { logout, user } = useAuthStore();
  const location = useLocation();

  return (
    <aside
      className={`admin-sidebar ${sidebarCollapsed ? 'admin-sidebar--collapsed' : ''}`}
    >
      {/* Logo */}
      <div className="admin-sidebar__logo">
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
              <span className="text-lg font-serif font-bold tracking-tight text-manchester-white">
                MANCHESTER
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </motion.div>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span className="text-lg font-serif font-bold text-red-500">M</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="admin-sidebar__nav">
        <div className="space-y-1">
          {navItems.filter(item => !item.adminOnly || user?.role === 'Admin').map((item) => {
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
                className={`admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}
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
                    layoutId="admin-nav-indicator"
                    className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="admin-sidebar__bottom">
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
          className="admin-sidebar__link text-white/40 hover:text-red-400"
          title={sidebarCollapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Cerrar sesión</span>
          )}
        </button>

        <button
          onClick={toggleSidebar}
          className="admin-sidebar__toggle"
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

export default AdminSidebar;
