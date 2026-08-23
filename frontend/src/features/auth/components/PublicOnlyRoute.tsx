import React from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';

export const PublicOnlyRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams] = useSearchParams();

  if (isAuthenticated) {
    const redirectUrl = searchParams.get('redirect') || '/';
    return <Navigate to={redirectUrl} replace />;
  }

  return <Outlet />;
};
