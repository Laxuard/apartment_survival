import { useMemo } from 'react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useBillsQuery, usePayBillMutation } from './useBillsQueries';
import { calculateBillsSummary, type BillsSummary } from '../utils/billsCalculations';
import type { Bill } from '../types';

export interface BillsSummaryState extends BillsSummary {
  bills: Bill[];
  isLoading: boolean;
  currency: string;
  payBill: (billId: string) => void;
  isPayingBill: boolean;
}

/**
 * Universal Hook for Bills and Recurring Utilities
 */
export const useBillsSummary = (): BillsSummaryState => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const getActiveCurrency = useHouseholdStore((s) => s.getActiveCurrency);
  const currency = getActiveCurrency();

  const { data: bills = [], isLoading } = useBillsQuery(activeHouseholdId);
  const payBillMutation = usePayBillMutation(activeHouseholdId);

  const summary = useMemo(() => calculateBillsSummary(bills, currency), [bills, currency]);

  const payBill = (billId: string) => {
    payBillMutation.mutate(billId);
  };

  return {
    bills,
    isLoading,
    currency,
    ...summary,
    payBill,
    isPayingBill: payBillMutation.isPending,
  };
};

