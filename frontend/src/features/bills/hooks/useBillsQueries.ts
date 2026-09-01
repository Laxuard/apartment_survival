import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../api/billsApi';
import { expensesApi } from '@/features/expenses/api/expensesApi';
import { queryKeys } from '@/lib/queryKeys';
import { getCurrentPeriod, getCurrentMonthName } from '../utils/billsCalculations';
import type { RecurringBill, CreateRecurringBillDto } from '../types';




export const BILLS_QUERY_KEY = (householdId: string | null) => ['households', householdId, 'bills'];

const STORAGE_PREFIX = 'apartment_survival_recurring_bills_';

const getStoredBills = (householdId: string): RecurringBill[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${householdId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Failed to parse stored recurring bills:', err);
  }
  return [];
};

const saveStoredBills = (householdId: string, bills: RecurringBill[]) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${householdId}`, JSON.stringify(bills));
  } catch (err) {
    console.warn('Failed to persist recurring bills:', err);
  }
};

export const useBillsQuery = (householdId: string | null) => {
  return useQuery<RecurringBill[]>({
    queryKey: BILLS_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];

      const stored = getStoredBills(householdId);
      if (stored.length > 0) {
        return stored;
      }

      // If nothing in storage, try backend
      try {
        const backendBills = await billsApi.getBills(householdId);
        if (backendBills && backendBills.length > 0) {
          const mapped: RecurringBill[] = backendBills.map((b) => ({
            id: b.id,
            householdId,
            title: b.title,
            amount: b.amount,
            currency: b.currency,
            category: (b.category as any) || (b.iconName === 'home' ? 'RENT' : 'UTILITIES'),
            dueDayOfMonth: b.dueDayOfMonth ?? (b.dueDays != null ? ((new Date().getDate() + b.dueDays - 1) % 28 + 1) : 5),
            responsiblePayerId: b.responsiblePayerId || '',
            responsiblePayerName: b.responsiblePayerName || 'You',
            splitStrategy: 'EQUAL',
            lastPaidPeriod: b.isPaid ? getCurrentPeriod() : undefined,
            iconName: b.iconName || 'home',
          }));
          saveStoredBills(householdId, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Could not fetch backend bills, using empty list:', err);
      }

      return [];
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateRecurringBillMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateRecurringBillDto) => {
      if (!householdId) throw new Error('No active household selected');

      const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bill-${Date.now()}`;
      const newBill: RecurringBill = {
        id,
        householdId,
        title: dto.title.trim(),
        amount: dto.amount,
        category: dto.category,
        dueDayOfMonth: dto.dueDayOfMonth,
        responsiblePayerId: dto.responsiblePayerId,
        splitStrategy: 'EQUAL',
        iconName: dto.iconName || (dto.category === 'RENT' ? 'home' : dto.category === 'UTILITIES' ? 'bolt' : 'other'),
        createdAt: new Date().toISOString(),
      };

      // Also try creating in backend if available
      try {
        await billsApi.createBill(householdId, {
          title: newBill.title,
          amount: newBill.amount,
          dueDays: Math.max(0, newBill.dueDayOfMonth - new Date().getDate()),
          autoSplit: true,
          iconName: newBill.iconName as any,
        });
      } catch (err) {
        console.warn('Backend bill sync warning:', err);
      }

      const existing = getStoredBills(householdId);
      const updated = [...existing, newBill];
      saveStoredBills(householdId, updated);

      return newBill;
    },
    onSuccess: (newBill) => {
      queryClient.setQueryData<RecurringBill[]>(BILLS_QUERY_KEY(householdId), (old = []) => [
        ...old,
        newBill,
      ]);
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY(householdId) });
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(householdId) });
      }
    },
  });
};

export const useDeleteRecurringBillMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      if (!householdId) throw new Error('No active household selected');
      const existing = getStoredBills(householdId);
      const updated = existing.filter((b) => b.id !== billId);
      saveStoredBills(householdId, updated);
      return billId;
    },
    onSuccess: (billId) => {
      queryClient.setQueryData<RecurringBill[]>(BILLS_QUERY_KEY(householdId), (old = []) =>
        old.filter((b) => b.id !== billId)
      );
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY(householdId) });
    },
  });
};

export interface MarkBillPaidParams {
  bill: RecurringBill;
  actualAmount: number;
  paidByUserId: string;
  expenseDate?: string;
  notes?: string;
}

export const useMarkBillPaidMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bill, actualAmount, paidByUserId: _paidByUserId, expenseDate }: MarkBillPaidParams) => {
      if (!householdId) throw new Error('No active household selected');


      const currentPeriod = getCurrentPeriod();
      const currentMonth = getCurrentMonthName();
      const expenseTitle = `${bill.title} - ${currentMonth}`;

      // 1. Auto-create Expense in financial ledger
      const validCategory =
        bill.category === 'RENT'
          ? 'RENT'
          : bill.category === 'MAINTENANCE'
          ? 'MAINTENANCE'
          : bill.category === 'OTHER'
          ? 'OTHER'
          : 'UTILITIES';

      let isoExpenseDate: string;
      try {
        isoExpenseDate = expenseDate ? new Date(expenseDate).toISOString() : new Date().toISOString();
      } catch {
        isoExpenseDate = new Date().toISOString();
      }

      await expensesApi.createExpense(householdId, {
        title: expenseTitle,
        description: `Recurring payment for ${bill.title} (${currentPeriod})`,
        amount: actualAmount,
        category: validCategory,
        splitType: 'EQUAL',
        expenseDate: isoExpenseDate,
      });



      // 2. Mark Bill as Paid for the cycle in storage
      const existing = getStoredBills(householdId);
      const updated = existing.map((b) => {
        if (b.id === bill.id) {
          return {
            ...b,
            lastPaidPeriod: currentPeriod,
          };
        }
        return b;
      });
      saveStoredBills(householdId, updated);

      // 3. Try to sync pay status to backend if applicable
      try {
        await billsApi.payBill(householdId, bill.id);
      } catch {
        // Ignored if local or non-UUID id
      }

      return { billId: bill.id, period: currentPeriod };
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.balances(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(householdId) });
      }
    },
  });
};

// Legacy compatibility mutations
export const useCreateBillMutation = useCreateRecurringBillMutation;
export const usePayBillMutation = (householdId: string | null) => {
  const markPaid = useMarkBillPaidMutation(householdId);
  return {
    ...markPaid,
    mutate: (billId: string) => {
      const existing = getStoredBills(householdId || '');
      const found = existing.find((b) => b.id === billId);
      if (found) {
        markPaid.mutate({
          bill: found,
          actualAmount: found.amount,
          paidByUserId: found.responsiblePayerId,
        });
      }
    },
  };
};


