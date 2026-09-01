import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_CURRENCY, type SplitMethod } from '@/domain';
import { queryKeys } from '@/lib/queryKeys';
import { expensesApi } from '../api/expensesApi';
import type {
  Expense,
  ExpenseCategory,
  CreateExpenseBackendDto,
  CreateSettlementDto,
  HouseholdBalancesResponse,
  BackendExpenseDetail,
  SettlementDetail,
} from '../types';

const parseCategory = (cat: string): ExpenseCategory => {
  const upper = cat?.toUpperCase();
  if (
    upper === 'GROCERIES' ||
    upper === 'UTILITIES' ||
    upper === 'RENT' ||
    upper === 'HOUSEHOLD' ||
    upper === 'OTHER'
  ) {
    return upper;
  }
  return 'GROCERIES';
};

const parseSplitMethod = (split: string): SplitMethod => {
  const upper = split?.toUpperCase();
  if (upper === 'EXACT' || upper === 'PERCENTAGE' || upper === 'EQUAL' || upper === 'SHARES') {
    return upper as SplitMethod;
  }
  return 'EQUAL';
};

export const useExpensesQuery = (householdId: string | null) => {
  return useQuery<Expense[]>({
    queryKey: householdId ? queryKeys.expenses.all(householdId) : ['expenses', null],
    queryFn: async () => {
      if (!householdId) return [];
      const data = await expensesApi.getExpenses(householdId);
      return data.map((item) => ({
        id: item.expenseId,
        description: item.title,
        amount: Number(item.amount),
        currency: item.currency || DEFAULT_CURRENCY,
        payerId: item.paidByUserId,
        payerName: item.paidByUsername,
        category: parseCategory(item.category),
        splitMethod: parseSplitMethod(item.splitType),
        splits: [],
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'today',
      }));
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 1,
  });
};

export const useBalancesQuery = (householdId: string | null) => {
  return useQuery<HouseholdBalancesResponse | null>({
    queryKey: householdId ? queryKeys.balances(householdId) : ['balances', null],
    queryFn: async () => {
      if (!householdId) return null;
      return await expensesApi.getBalances(householdId);
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 1,
  });
};

export const useCreateExpenseMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<BackendExpenseDetail, Error, CreateExpenseBackendDto>({
    mutationFn: async (dto: CreateExpenseBackendDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await expensesApi.createExpense(householdId, dto);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.all(householdId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.balances(householdId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard(householdId),
        });
      }
    },
  });
};

export const useCreateSettlementMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<SettlementDetail, Error, CreateSettlementDto>({
    mutationFn: async (dto: CreateSettlementDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await expensesApi.createSettlement(householdId, dto);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.balances(householdId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.expenses.all(householdId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard(householdId),
        });
      }
    },
  });
};

export const useSettleMutation = useCreateSettlementMutation;
