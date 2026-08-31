import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const AuthGuard: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  return <Outlet />;
};
