import { useMemo } from 'react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useRoommatesQuery } from '@/features/roommates/hooks/useRoommatesQueries';
import {
  calculateHouseholdMetrics,
  type HouseholdCalculations,
} from '../utils/householdCalculations';

export interface HouseholdMetricsState extends HouseholdCalculations {
  activeHouseholdId: string | null;
  currency: string;
  householdName: string;
  wifiSsid: string;
  wifiPassword: string;
  isAdmin: boolean;
}

/**
 * Universal Hook for Household Capacity, Budget Splits, and Occupancy Metrics
 */
export const useHouseholdMetrics = (): HouseholdMetricsState => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const currency = getActiveCurrency();

  const { data: members = [] } = useRoommatesQuery(activeHouseholdId, currency);

  return useMemo(() => {
    const calculations = calculateHouseholdMetrics(activeHousehold, members.length);

    return {
      ...calculations,
      activeHouseholdId,
      currency,
      householdName: activeHousehold?.name || 'Apartment',
      wifiSsid: activeHousehold?.wifiSsid || '',
      wifiPassword: activeHousehold?.wifiPassword || '',
      isAdmin: activeHousehold?.role === 'ADMIN',
    };
  }, [activeHousehold, members.length, activeHouseholdId, currency]);
};

