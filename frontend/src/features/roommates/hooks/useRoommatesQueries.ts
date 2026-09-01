import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/useAuthStore';
import { queryKeys } from '@/lib/queryKeys';
import { roommatesApi } from '../api/roommatesApi';
import type {
  Roommate,
  InviteRoommateDto,
  DirectSettlementPath,
  MemberRole,
  HouseholdInviteSummary,
  CreateDirectInviteDto,
  CreateLinkInviteDto,
} from '../types';

export const ROOMMATES_QUERY_KEY = (householdId: string | null) =>
  householdId ? queryKeys.roommates(householdId) : (['roommates', null] as const);

export const HOUSEHOLD_INVITES_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'invites',
];

export const SETTLEMENT_MATRIX_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'settlements',
  'matrix',
];

export const useRoommatesQuery = (householdId: string | null, activeCurrency: string = 'MAD') => {
  const currentUser = useAuthStore((s) => s.user);

  return useQuery<Roommate[]>({
    queryKey: [...ROOMMATES_QUERY_KEY(householdId), currentUser?.id],
    queryFn: async () => {
      if (!householdId) return [];
      const members = await roommatesApi.getRoommates(householdId);

      // Deduplicate members by id
      const uniqueMap = new Map<string, Roommate>();
      for (const m of members) {
        if (!uniqueMap.has(m.id)) {
          uniqueMap.set(m.id, m);
        }
      }

      return Array.from(uniqueMap.values()).map((m) => {
        const isCurrent = Boolean(
          (currentUser?.id && m.id === currentUser.id) ||
          (currentUser?.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser?.name && m.name && m.name.toLowerCase() === currentUser.name.toLowerCase())
        );

        return {
          ...m,
          currency: m.currency || activeCurrency,
          isCurrentUser: isCurrent,
        };
      });
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

  return useMutation<{ inviteId: string; inviteUrl: string }, Error, InviteRoommateDto>({
    mutationFn: async (dto: InviteRoommateDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.inviteRoommate(householdId, dto);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.roommates(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.balances(householdId) });
      }
    },
  });
};

export interface UpdateMemberRoleVariables {
  memberId: string;
  role: MemberRole;
}

export const useUpdateMemberRoleMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, UpdateMemberRoleVariables>({
    mutationFn: async ({ memberId, role }: UpdateMemberRoleVariables) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.updateMemberRole(householdId, memberId, role);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.roommates(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.household(householdId) });
      }
      toast.success('Member role updated successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update member role.');
    },
  });
};

export const useUpdateRoleMutation = useUpdateMemberRoleMutation;

export const useKickMemberMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: async (memberId: string) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.kickMember(householdId, memberId);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.roommates(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.household(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.balances(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(householdId) });
        queryClient.invalidateQueries({ queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId) });
      }
      toast.success('Member removed from household.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove member.');
    },
  });
};

export interface SettleMemberVariables {
  memberId: string;
  amount: number;
  paymentMethod: string;
}

export const useSettleMemberMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, SettleMemberVariables>({
    mutationFn: async ({
      memberId,
      amount,
      paymentMethod,
    }: SettleMemberVariables) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.settleMemberBalance(householdId, memberId, amount, paymentMethod);
    },
    onSuccess: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.roommates(householdId) });
        queryClient.invalidateQueries({ queryKey: SETTLEMENT_MATRIX_QUERY_KEY(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.balances(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(householdId) });
      }
      toast.success('Payment settled successfully.');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to settle balance.');
    },
  });
};

export const useHouseholdInvitesQuery = (householdId: string | null) => {
  return useQuery<HouseholdInviteSummary[]>({
    queryKey: HOUSEHOLD_INVITES_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      return await roommatesApi.getHouseholdInvites(householdId);
    },
    enabled: !!householdId,
    staleTime: 1000 * 30,
  });
};

export const useCreateDirectInviteMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateDirectInviteDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.createDirectInvite(householdId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_INVITES_QUERY_KEY(householdId) });
    },
  });
};

export const useCreateLinkInviteMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateLinkInviteDto = {}) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.createLinkInvite(householdId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_INVITES_QUERY_KEY(householdId) });
    },
  });
};

export const useRevokeInviteMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      if (!householdId) throw new Error('No active household selected');
      return await roommatesApi.revokeInvite(householdId, inviteId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_INVITES_QUERY_KEY(householdId) });
    },
  });
};

