import { LoadingScreen } from '@/components/common/LoadingScreen';
import { useCurrentUserQuery } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

export const PublicGuard: React.FC = () => {
  useCurrentUserQuery();
  const { isAuthenticated, isInitialized } = useAuthStore();
  const [searchParams] = useSearchParams();

  if (!isInitialized) {
    return <LoadingScreen message="Checking session..." />;
  }

  if (isAuthenticated) {
    const redirectUrl = searchParams.get('redirect') || '/hub';
    return <Navigate to={redirectUrl} replace />;
  }

  return <Outlet />;
};
