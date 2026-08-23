import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useHouseholdsQuery } from '../api/useHouseholdsQuery';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export const HouseholdRequiredGuard: React.FC = () => {
  const { data: households, isLoading, isError } = useHouseholdsQuery();
  const { activeHouseholdId, setActiveHousehold, setHouseholds } = useHouseholdStore();

  useEffect(() => {
    if (households && households.length > 0) {
      setHouseholds(households);

      // Ensure activeHouseholdId is valid
      const isValid = households.some((h) => h.id === activeHouseholdId);
      if (!activeHouseholdId || !isValid) {
        setActiveHousehold(households[0].id);
      }
    }
  }, [households, activeHouseholdId, setHouseholds, setActiveHousehold]);

  if (isLoading) {
    return <LoadingScreen message="Loading your households..." />;
  }

  // If user has 0 households, redirect to onboarding to create or join one
  if (isError || !households || households.length === 0) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};
