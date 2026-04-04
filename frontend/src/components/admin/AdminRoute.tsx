import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not authenticated → redirect to login (preserve attempted URL)
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but normal Client → redirect to home
  if (user.role === 'Cliente') {
    return <Navigate to="/" replace />;
  }

  // If user is Vendedor, redirect to their dedicated seller portal
  if (user.role === 'Vendedor') {
    return <Navigate to="/seller" replace />;
  }

  // Admin → render child routes
  return <Outlet />;
};

export default AdminRoute;
