import { apiClient } from '@/lib/api-client';
import type {
  BackendHouseholdDetail,
  BackendHouseholdSummary,
  CreateHouseholdDto,
  UpdateHouseholdDto,
  JoinWithCodeDto,
  UserInboxInvite,
} from '../types';

export const householdsApi = {
  getMyHouseholds: async (): Promise<BackendHouseholdSummary[]> => {
    const { data } = await apiClient.get<BackendHouseholdSummary[]>('/households');
    return data;
  },

  getHouseholdDetail: async (householdId: string): Promise<BackendHouseholdDetail> => {
    const { data } = await apiClient.get<BackendHouseholdDetail>(`/households/${householdId}`);
    return data;
  },

  createHousehold: async (dto: CreateHouseholdDto): Promise<BackendHouseholdSummary> => {
    const { data } = await apiClient.post<BackendHouseholdSummary>('/households', dto);
    return data;
  },

  updateHousehold: async (
    householdId: string,
    dto: UpdateHouseholdDto
  ): Promise<BackendHouseholdSummary> => {
    const { data } = await apiClient.put<BackendHouseholdSummary>(`/households/${householdId}`, dto);
    return data;
  },

  leaveHousehold: async (householdId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/households/${householdId}/members/${userId}`);
  },

  joinWithCode: async (dto: JoinWithCodeDto): Promise<BackendHouseholdSummary> => {
    const { data } = await apiClient.post<BackendHouseholdSummary>('/households/join', dto);
    return data;
  },

  getMyPendingInvites: async (): Promise<UserInboxInvite[]> => {
    const { data } = await apiClient.get<UserInboxInvite[]>('/me/invites');
    return data;
  },

  acceptDirectInvite: async (inviteId: string): Promise<BackendHouseholdSummary> => {
    const { data } = await apiClient.post<BackendHouseholdSummary>(
      `/me/invites/${inviteId}/accept`
    );
    return data;
  },

  declineDirectInvite: async (inviteId: string): Promise<void> => {
    await apiClient.post(`/me/invites/${inviteId}/decline`);
  },
};
