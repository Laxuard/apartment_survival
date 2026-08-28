import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdsApi } from '../api/householdsApi';
import type { CreateHouseholdDto, JoinWithCodeDto, UserInboxInvite } from '../types';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import type { HouseholdMembership } from '@/types';

export const HOUSEHOLDS_QUERY_KEY = ['user', 'households'];
export const HOUSEHOLD_DETAIL_KEY = (householdId: string | null) => ['households', householdId];
export const PENDING_INVITES_KEY = ['user', 'invites'];

/**
 * Fetch and synchronize user household memberships with backend.
 */
export const useHouseholdsQuery = () => {
  const storeHouseholds = useHouseholdStore((s) => s.households);

  return useQuery<HouseholdMembership[]>({
    queryKey: HOUSEHOLDS_QUERY_KEY,
    queryFn: async () => {
      try {
        const summaries = await householdsApi.getMyHouseholds();
        return summaries.map((s) => ({
          id: s.householdId,
          name: s.name,
          role: 'ADMIN' as const,
          currency: typeof s.currency === 'string' ? s.currency : 'MAD',
          memberCount: s.memberCount,
        }));
      } catch {
        // Fallback to local store during initial setup/offline
        return storeHouseholds;
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useHouseholdDetailQuery = (householdId: string | null) => {
  return useQuery({
    queryKey: HOUSEHOLD_DETAIL_KEY(householdId),
    queryFn: () => (householdId ? householdsApi.getHouseholdDetail(householdId) : null),
    enabled: !!householdId,
  });
};

export const useCreateHouseholdMutation = () => {
  const queryClient = useQueryClient();
  const addHousehold = useHouseholdStore((s) => s.addHousehold);

  return useMutation({
    mutationFn: (dto: CreateHouseholdDto) => householdsApi.createHousehold(dto),
    onSuccess: (created) => {
      addHousehold({
        id: created.householdId,
        name: created.name,
        role: 'ADMIN',
        currency: typeof created.currency === 'string' ? created.currency : 'MAD',
        memberCount: 1,
      });
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEY });
    },
  });
};

export const useJoinHouseholdMutation = () => {
  const queryClient = useQueryClient();
  const addHousehold = useHouseholdStore((s) => s.addHousehold);

  return useMutation({
    mutationFn: (dto: JoinWithCodeDto) => householdsApi.joinWithCode(dto),
    onSuccess: (joined) => {
      addHousehold({
        id: joined.householdId,
        name: joined.name,
        role: 'MEMBER',
        currency: typeof joined.currency === 'string' ? joined.currency : 'MAD',
        memberCount: joined.memberCount,
      });
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEY });
    },
  });
};

export const usePendingInvitesQuery = () => {
  return useQuery<UserInboxInvite[]>({
    queryKey: PENDING_INVITES_KEY,
    queryFn: async () => {
      try {
        return await householdsApi.getMyPendingInvites();
      } catch {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useAcceptInviteMutation = () => {
  const queryClient = useQueryClient();
  const addHousehold = useHouseholdStore((s) => s.addHousehold);

  return useMutation({
    mutationFn: (inviteId: string) => householdsApi.acceptDirectInvite(inviteId),
    onSuccess: (joined) => {
      addHousehold({
        id: joined.householdId,
        name: joined.name,
        role: 'MEMBER',
        currency: typeof joined.currency === 'string' ? joined.currency : 'MAD',
        memberCount: joined.memberCount,
      });
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_KEY });
    },
  });
};

export const useDeclineInviteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inviteId: string) => householdsApi.declineDirectInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_INVITES_KEY });
    },
  });
};

