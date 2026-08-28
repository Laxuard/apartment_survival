import { apiClient } from '@/lib/api-client';
import type { Roommate, InviteRoommateDto, DirectSettlementPath, MemberRole } from '../types';

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

  updateMemberRole: async (
    householdId: string,
    memberId: string,
    role: MemberRole
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.patch<{ success: boolean }>(
      `/households/${householdId}/members/${memberId}/role`,
      { role }
    );
    return data;
  },

  kickMember: async (
    householdId: string,
    memberId: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.delete<{ success: boolean }>(
      `/households/${householdId}/members/${memberId}`
    );
    return data;
  },

  settleMemberBalance: async (
    householdId: string,
    memberId: string,
    amount: number,
    paymentMethod: string
  ): Promise<{ success: boolean }> => {
    const { data } = await apiClient.post<{ success: boolean }>(
      `/households/${householdId}/members/${memberId}/settle`,
      { amount, paymentMethod }
    );
    return data;
  },
};
