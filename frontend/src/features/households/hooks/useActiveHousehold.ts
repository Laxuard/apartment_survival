import { useEffect } from 'react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useHouseholdsQuery } from './useHouseholdsQueries';
import { DEFAULT_CURRENCY } from '@/domain';
import type { HouseholdMembership } from '@/types';

/**
 * useActiveHousehold hook
 * Single source of truth combining React Query server state with client-selected active ID.
 */
export const useActiveHousehold = () => {
  const { data: households = [], isLoading, isError, refetch } = useHouseholdsQuery();
  const { activeHouseholdId, setActiveHouseholdId } = useHouseholdStore();

  // Synchronize active selection with available households from server
  useEffect(() => {
    if (households.length > 0) {
      const exists = households.some((h) => h.id === activeHouseholdId);
      if (!activeHouseholdId || !exists) {
        setActiveHouseholdId(households[0].id);
      }
    } else if (activeHouseholdId !== null) {
      setActiveHouseholdId(null);
    }
  }, [households, activeHouseholdId, setActiveHouseholdId]);

  const activeHousehold: HouseholdMembership | null =
    households.find((h) => h.id === activeHouseholdId) || households[0] || null;

  const activeCurrency = activeHousehold?.currency || DEFAULT_CURRENCY;

  return {
    activeHousehold,
    activeHouseholdId: activeHousehold?.id ?? null,
    activeCurrency,
    households,
    isLoading,
    isError,
    refetch,
    setActiveHousehold: setActiveHouseholdId,
  };
};

