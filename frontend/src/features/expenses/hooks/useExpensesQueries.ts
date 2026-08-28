import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '../api/expensesApi';
import { MOCK_EXPENSES } from '../mocks/expensesData';
import type {
  Expense,
  ExpenseCategory,
  SplitMethod,
  CreateExpenseBackendDto,
  CreateSettlementDto,
  HouseholdBalancesResponse,
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
  if (upper === 'EXACT' || upper === 'PERCENTAGE' || upper === 'EQUAL') {
    return upper;
  }
  return 'EQUAL';
};

export const useExpensesQuery = (householdId: string | null) => {
  return useQuery<Expense[]>({
    queryKey: ['households', householdId, 'expenses'],
    queryFn: async () => {
      if (!householdId) return [];
      try {
        const data = await expensesApi.getExpenses(householdId);
        return data.map((item) => ({
          id: item.expenseId,
          description: item.title,
          amount: Number(item.amount),
          currency: item.currency || 'MAD',
          payerId: item.paidByUserId,
          payerName: item.paidByUsername,
          category: parseCategory(item.category),
          splitMethod: parseSplitMethod(item.splitType),
          splits: [],
          createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'today',
        }));
      } catch {
        // Graceful fallback to mock data if backend is offline
        return MOCK_EXPENSES;
      }
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 1,
  });
};

export const useBalancesQuery = (householdId: string | null) => {
  return useQuery<HouseholdBalancesResponse | null>({
    queryKey: ['households', householdId, 'balances'],
    queryFn: async () => {
      if (!householdId) return null;
      try {
        return await expensesApi.getBalances(householdId);
      } catch {
        return null;
      }
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 1,
  });
};

export const useCreateExpenseMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateExpenseBackendDto) => {
      if (!householdId) throw new Error('No active household selected');
      return expensesApi.createExpense(householdId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['households', householdId, 'expenses'],
      });
      queryClient.invalidateQueries({
        queryKey: ['households', householdId, 'balances'],
      });
    },
  });
};

export const useCreateSettlementMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateSettlementDto) => {
      if (!householdId) throw new Error('No active household selected');
      return expensesApi.createSettlement(householdId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['households', householdId, 'balances'],
      });
      queryClient.invalidateQueries({
        queryKey: ['households', householdId, 'expenses'],
      });
    },
  });
};
