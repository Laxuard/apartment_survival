import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdsApi } from '../api/householdsApi';
import type { CreateHouseholdDto, UpdateHouseholdDto, JoinWithCodeDto, UserInboxInvite } from '../types';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import type { HouseholdMembership } from '@/types';

export const HOUSEHOLDS_QUERY_KEY = ['user', 'households'];
export const HOUSEHOLD_DETAIL_KEY = (householdId: string | null) => ['households', householdId];
export const PENDING_INVITES_KEY = ['user', 'invites'];

/**
 * Fetch and synchronize user household memberships with backend.
 */
export const useHouseholdsQuery = () => {
  return useQuery<HouseholdMembership[]>({
    queryKey: HOUSEHOLDS_QUERY_KEY,
    queryFn: async () => {
      const summaries = await householdsApi.getMyHouseholds();
      return summaries.map((s) => ({
        id: s.householdId,
        name: s.name,
        role: s.role || 'ADMIN',
        currency: typeof s.currency === 'string' ? s.currency : 'MAD',
        memberCount: s.memberCount,
        description: s.description,
        monthlyBudget: s.monthlyBudget ?? 0,
        capacity: s.maxMembers ?? 4,
        wifiSsid: s.wifiSsid || '',
        wifiPassword: s.wifiPassword || '',
        splitAlgorithm: s.splitAlgorithm || 'DEBT_SIMPLIFIED',
        defaultSplitMethod: s.defaultSplitMethod || 'EQUAL',
        defaultSplitAllocations: typeof s.defaultSplitAllocations === 'string'
          ? (() => { try { return JSON.parse(s.defaultSplitAllocations); } catch { return {}; } })()
          : (s.defaultSplitAllocations || {}),
        autoRestockFromExpenses: s.autoRestockFromExpenses ?? true,
      }));
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
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);

  return useMutation({
    mutationFn: (dto: CreateHouseholdDto) => householdsApi.createHousehold(dto),
    onSuccess: (created) => {
      setActiveHousehold(created.householdId);
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEY });
    },
  });
};

export const useUpdateHouseholdMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ householdId, dto }: { householdId: string; dto: UpdateHouseholdDto }) =>
      householdsApi.updateHousehold(householdId, dto),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: HOUSEHOLD_DETAIL_KEY(updated.householdId) });
    },
  });
};

export const useJoinHouseholdMutation = () => {
  const queryClient = useQueryClient();
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);

  return useMutation({
    mutationFn: (dto: JoinWithCodeDto) => householdsApi.joinWithCode(dto),
    onSuccess: (joined) => {
      setActiveHousehold(joined.householdId);
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
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);

  return useMutation({
    mutationFn: (inviteId: string) => householdsApi.acceptDirectInvite(inviteId),
    onSuccess: (joined) => {
      setActiveHousehold(joined.householdId);
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
