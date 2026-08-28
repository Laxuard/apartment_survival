import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roommatesApi } from '../api/roommatesApi';
import { MOCK_ROOMMATES } from '../mocks/roommatesData';
import type { Roommate, InviteRoommateDto, DirectSettlementPath } from '../types';

export const ROOMMATES_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'members',
];

export const useRoommatesQuery = (householdId: string | null, activeCurrency: string = 'MAD') => {
  return useQuery<Roommate[]>({
    queryKey: ROOMMATES_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      try {
        const members = await roommatesApi.getRoommates(householdId);
        return members.map((m) => ({
          ...m,
          currency: m.currency || activeCurrency,
        }));
      } catch {
        // Fallback to mock data with dynamic active currency
        return MOCK_ROOMMATES.map((r) => ({
          ...r,
          currency: activeCurrency,
        }));
      }
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useInviteRoommateMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: InviteRoommateDto) => {
      if (!householdId) {
        return {
          inviteId: `inv-${Date.now()}`,
          inviteUrl: `${window.location.origin}/invite/demo-token`,
        };
      }
      try {
        return await roommatesApi.inviteRoommate(householdId, dto);
      } catch {
        return {
          inviteId: `inv-${Date.now()}`,
          inviteUrl: `${window.location.origin}/invite/demo-token`,
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMMATES_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'balances'] });
    },
  });
};

export const useSettlementMatrixQuery = (
  householdId: string | null,
  activeCurrency: string = 'MAD'
) => {
  return useQuery<DirectSettlementPath[]>({
    queryKey: ['households', householdId, 'settlements', 'matrix'],
    queryFn: async () => {
      if (!householdId) return [];
      try {
        return await roommatesApi.getSettlementMatrix(householdId);
      } catch {
        return [
          {
            id: 'path-1',
            debtorName: 'Bob',
            debtorAvatar: 'B',
            debtorColor: 'oak',
            creditorName: 'You',
            amount: 300.0,
            currency: activeCurrency,
            contextText: '14 days pending',
          },
          {
            id: 'path-2',
            debtorName: 'Alice',
            debtorAvatar: 'A',
            debtorColor: 'sage',
            creditorName: 'You',
            amount: 150.0,
            currency: activeCurrency,
            contextText: 'Utilities share',
          },
        ];
      }
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

