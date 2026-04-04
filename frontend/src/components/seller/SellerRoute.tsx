import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const SellerRoute: React.FC = () => {
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

  // If user is Admin, redirect to their dedicated admin portal
  if (user.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  // Vendedor → render child routes
  return <Outlet />;
};

export default SellerRoute;
