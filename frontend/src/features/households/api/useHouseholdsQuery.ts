import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { householdsApi } from './householdsApi';
import type { CreateHouseholdDto, JoinWithCodeDto } from '../types';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import type { HouseholdMembership } from '@/types';

/**
 * Fetch and synchronize user household memberships with backend.
 */
export const useHouseholdsQuery = () => {
  const storeHouseholds = useHouseholdStore((s) => s.households);

  return useQuery<HouseholdMembership[]>({
    queryKey: ['user', 'households'],
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
      } catch (err) {
        // Fallback to local store during initial setup/offline
        return storeHouseholds;
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useHouseholdDetailQuery = (householdId: string | null) => {
  return useQuery({
    queryKey: ['households', householdId],
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
      queryClient.invalidateQueries({ queryKey: ['user', 'households'] });
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
      queryClient.invalidateQueries({ queryKey: ['user', 'households'] });
    },
  });
};

export const usePendingInvitesQuery = () => {
  return useQuery({
    queryKey: ['user', 'invites'],
    queryFn: async () => {
      try {
        return await householdsApi.getMyPendingInvites();
      } catch (err) {
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};
