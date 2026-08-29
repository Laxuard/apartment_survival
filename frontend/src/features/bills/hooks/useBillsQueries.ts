import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { billsApi } from '../api/billsApi';
import type { Bill, CreateBillDto } from '../types';

export const BILLS_QUERY_KEY = (householdId: string | null) => ['households', householdId, 'bills'];

export const useBillsQuery = (householdId: string | null) => {
  return useQuery<Bill[]>({
    queryKey: BILLS_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      return await billsApi.getBills(householdId);
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateBillMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateBillDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await billsApi.createBill(householdId, dto);
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
      if (!householdId) throw new Error('No active household selected');
      return await billsApi.payBill(householdId, billId);
    },
    onSuccess: (_, billId) => {
      queryClient.setQueryData<Bill[]>(BILLS_QUERY_KEY(householdId), (old = []) =>
        old.filter((b) => b.id !== billId)
      );
      queryClient.invalidateQueries({ queryKey: BILLS_QUERY_KEY(householdId) });
    },
  });
};

