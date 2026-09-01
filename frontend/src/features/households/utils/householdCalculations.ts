import { DEFAULT_CURRENCY, formatMoney } from '@/domain';
import type { HouseholdMembership } from '@/types';

export interface HouseholdCalculations {
  capacity: number;
  memberCount: number;
  openSlots: number;
  isAtCapacity: boolean;
  occupancyPercentage: number;
  monthlyBudget: number;
  perPersonBudget: number;
  formattedMonthlyBudget: string;
  formattedPerPersonBudget: string;
}

/**
 * Universal Household Metrics & Capacity Aggregator
 * Provides the mathematical invariants for flat capacity, budget splits, and open slots.
 */
export const calculateHouseholdMetrics = (
  household: HouseholdMembership | null,
  actualMemberCount?: number
): HouseholdCalculations => {
  const capacity = household?.capacity ?? 4;
  const memberCount = actualMemberCount !== undefined ? actualMemberCount : (household?.memberCount ?? 1);
  const openSlots = Math.max(0, capacity - memberCount);
  const isAtCapacity = memberCount >= capacity;
  const occupancyPercentage = capacity > 0 ? Math.min(100, Math.round((memberCount / capacity) * 100)) : 100;

  const monthlyBudget = household?.monthlyBudget ?? 6000;
  const perPersonBudget = memberCount > 0 ? Math.round(monthlyBudget / memberCount) : monthlyBudget;
  const currency = household?.currency || DEFAULT_CURRENCY;

  return {
    capacity,
    memberCount,
    openSlots,
    isAtCapacity,
    occupancyPercentage,
    monthlyBudget,
    perPersonBudget,
    formattedMonthlyBudget: formatMoney(monthlyBudget, currency, { decimals: 0 }),
    formattedPerPersonBudget: formatMoney(perPersonBudget, currency, { decimals: 0 }),
  };
};


