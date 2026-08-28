import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roommatesApi } from '../api/roommatesApi';
import { MOCK_ROOMMATES, MOCK_SETTLEMENT_PATHS } from '../mocks/roommatesData';
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
      try {
        const members = await roommatesApi.getRoommates(householdId);
        return members.map((m) => ({
          ...m,
          currency: m.currency || activeCurrency,
        }));
      } catch {
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

export const useSettlementMatrixQuery = (
  householdId: string | null,
  activeCurrency: string = 'MAD'
) => {
  return useQuery<DirectSettlementPath[]>({
    queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      try {
        return await roommatesApi.getSettlementMatrix(householdId);
      } catch {
        return MOCK_SETTLEMENT_PATHS.map((p) => ({
          ...p,
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

export const useUpdateMemberRoleMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: MemberRole }) => {
      if (!householdId) return { success: true };
      try {
        return await roommatesApi.updateMemberRole(householdId, memberId, role);
      } catch {
        return { success: true };
      }
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
      if (!householdId) return { success: true };
      try {
        return await roommatesApi.kickMember(householdId, memberId);
      } catch {
        return { success: true };
      }
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
      if (!householdId) return { success: true };
      try {
        return await roommatesApi.settleMemberBalance(householdId, memberId, amount, paymentMethod);
      } catch {
        return { success: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOMMATES_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId) });
      queryClient.invalidateQueries({ queryKey: ['households', householdId, 'balances'] });
    },
  });
};
