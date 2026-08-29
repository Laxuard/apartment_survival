import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roommatesApi } from '../api/roommatesApi';
import type { Roommate, InviteRoommateDto, DirectSettlementPath, MemberRole } from '../types';

export const ROOMMATES_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'members',
];

export const SETTLEMENT_MATRIX_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'settlements',
  'matrix',
];

export const useRoommatesQuery = (householdId: string | null, activeCurrency: string = 'MAD') => {
  return useQuery<Roommate[]>({
    queryKey: ROOMMATES_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      const members = await roommatesApi.getRoommates(householdId);
      return members.map((m) => ({
        ...m,
        currency: m.currency || activeCurrency,
      }));
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useSettlementMatrixQuery = (
  householdId: string | null,
  activeCurrency: string = 'MAD'
) => {
  return useQuery<DirectSettlementPath[]>({
    queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      const matrix = await roommatesApi.getSettlementMatrix(householdId);
      return matrix.map((p) => ({
        ...p,
        currency: p.currency || activeCurrency,
      }));
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useInviteRoommateMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: InviteRoommateDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.inviteRoommate(householdId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMMATES_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'balances'] });
    },
  });
};

export const useUpdateMemberRoleMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: MemberRole }) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.updateMemberRole(householdId, memberId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMMATES_QUERY_KEY(householdId) });
    },
  });
};

export const useKickMemberMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memberId: string) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.kickMember(householdId, memberId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMMATES_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId) });
    },
  });
};

export const useSettleMemberMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      memberId,
      amount,
      paymentMethod,
    }: {
      memberId: string;
      amount: number;
      paymentMethod: string;
    }) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.settleMemberBalance(householdId, memberId, amount, paymentMethod);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMMATES_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'balances'] });
    },
  });
};
