import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useCurrentUserQuery } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ProtectedRoute: React.FC = () => {
  useCurrentUserQuery();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();

  if (!isInitialized) {
    return <LoadingScreen message="Checking session..." />;
  }

  if (!isAuthenticated) {
    // Preserve attempted destination in redirect param
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  return <Outlet />;
};
