import { apiClient } from '@/lib/api-client';
import type { Roommate, InviteRoommateDto, DirectSettlementPath } from '../types';

export const roommatesApi = {
  getRoommates: async (householdId: string): Promise<Roommate[]> => {
    const { data } = await apiClient.get<Roommate[]>(`/households/${householdId}/members`);
    return data;
  },

  inviteRoommate: async (
    householdId: string,
    dto: InviteRoommateDto
  ): Promise<{ inviteId: string; inviteUrl: string }> => {
    const { data } = await apiClient.post<{ inviteId: string; inviteUrl: string }>(
      `/households/${householdId}/invites`,
      dto
    );
    return data;
  },

  getSettlementMatrix: async (householdId: string): Promise<DirectSettlementPath[]> => {
    const { data } = await apiClient.get<DirectSettlementPath[]>(
      `/households/${householdId}/settlements/matrix`
    );
    return data;
  },
};

