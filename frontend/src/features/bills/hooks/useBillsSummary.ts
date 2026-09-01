import { useMemo } from 'react';
import { useActiveHousehold } from '@/features/households';
import { useBillsQuery, useMarkBillPaidMutation, useDeleteRecurringBillMutation } from './useBillsQueries';
import { calculateBillsSummary, type BillsSummary } from '../utils/billsCalculations';
import type { RecurringBill } from '../types';

export interface BillsSummaryState extends BillsSummary {
  bills: RecurringBill[];
  isLoading: boolean;
  currency: string;
  payBill: (bill: RecurringBill, actualAmount?: number, paidByUserId?: string) => Promise<any>;
  deleteBill: (billId: string) => Promise<any>;
  isPayingBill: boolean;
}

/**
 * Universal Hook for Bills and Recurring Utilities
 */
export const useBillsSummary = (): BillsSummaryState => {
  const { activeHouseholdId, activeCurrency: currency } = useActiveHousehold();

  const { data: bills = [], isLoading } = useBillsQuery(activeHouseholdId);
  const markBillPaidMutation = useMarkBillPaidMutation(activeHouseholdId);
  const deleteBillMutation = useDeleteRecurringBillMutation(activeHouseholdId);

  const summary = useMemo(() => calculateBillsSummary(bills, currency), [bills, currency]);

  const payBill = async (bill: RecurringBill, actualAmount?: number, paidByUserId?: string) => {
    return await markBillPaidMutation.mutateAsync({
      bill,
      actualAmount: actualAmount ?? bill.amount,
      paidByUserId: paidByUserId || bill.responsiblePayerId,
    });
  };

  const deleteBill = async (billId: string) => {
    return await deleteBillMutation.mutateAsync(billId);
  };

  return {
    bills,
    isLoading,
    currency,
    ...summary,
    payBill,
    deleteBill,
    isPayingBill: markBillPaidMutation.isPending,
  };
};


