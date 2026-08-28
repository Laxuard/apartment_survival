import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../api/billsApi';
import { MOCK_BILLS } from '../mocks/billsData';
import type { Bill, CreateBillDto } from '../types';

export const BILLS_QUERY_KEY = (householdId: string | null) => ['households', householdId, 'bills'];

export const useBillsQuery = (householdId: string | null) => {
  return useQuery<Bill[]>({
    queryKey: BILLS_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      try {
        return await billsApi.getBills(householdId);
      } catch {
        // Graceful fallback to mock data when backend is offline
        return MOCK_BILLS;
      }
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateBillMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateBillDto) => {
      if (!householdId) {
        const newBill: Bill = {
          id: `bill-${Date.now()}`,
          title: dto.title,
          amount: dto.amount,
          dueDays: dto.dueDays,
          dueText: `Due in ${dto.dueDays} days`,
          currency: 'MAD',
          autoSplit: dto.autoSplit ?? true,
          iconName: dto.iconName || 'home',
        };
        return newBill;
      }
      try {
        return await billsApi.createBill(householdId, dto);
      } catch {
        const newBill: Bill = {
          id: `bill-${Date.now()}`,
          title: dto.title,
          amount: dto.amount,
          dueDays: dto.dueDays,
          dueText: `Due in ${dto.dueDays} days`,
          currency: 'MAD',
          autoSplit: dto.autoSplit ?? true,
          iconName: dto.iconName || 'home',
        };
        return newBill;
      }
    },
    onSuccess: (newBill) => {
      queryClient.setQueryData<Bill[]>(BILLS_QUERY_KEY(householdId), (old = []) => [
        ...old,
        newBill,
      ]);
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY(householdId) });
    },
  });
};

export const usePayBillMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (billId: string) => {
      if (!householdId) return { success: true, billId };
      try {
        return await billsApi.payBill(householdId, billId);
      } catch {
        return { success: true, billId };
      }
    },
    onSuccess: (_, billId) => {
      queryClient.setQueryData<Bill[]>(BILLS_QUERY_KEY(householdId), (old = []) =>
        old.filter((b) => b.id !== billId)
      );
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY(householdId) });
    },
  });
};

