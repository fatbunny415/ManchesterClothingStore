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

  // Authenticated but not Admin → redirect to home
  if (user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  // Admin → render child routes
  return <Outlet />;
};

export default AdminRoute;
