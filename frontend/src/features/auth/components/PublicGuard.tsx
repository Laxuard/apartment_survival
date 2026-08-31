import { useAuthStore } from '@/stores/useAuthStore';
import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';

export const PublicGuard: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const redirectUrl = searchParams.get('redirect') || '/hub';
    return <Navigate to={redirectUrl} replace />;
  }

  return <Outlet />;
};
