import { LoadingScreen } from '@/components/common/LoadingScreen';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useActiveHousehold } from '../hooks/useActiveHousehold';

export const HouseholdRequiredGuard: React.FC = () => {
  const { households, isLoading, isError } = useActiveHousehold();

  if (isLoading) {
    return <LoadingScreen message="Loading your households..." />;
  }

  // If user has 0 households, redirect to onboarding to create or join one
  if (isError || !households || households.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
