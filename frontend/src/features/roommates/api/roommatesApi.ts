import { apiClient } from '@/lib/api-client';
import type {
  Roommate,
  InviteRoommateDto,
  DirectSettlementPath,
  MemberRole,
  HouseholdInviteSummary,
  CreateDirectInviteDto,
  CreateLinkInviteDto,
} from '../types';

export const roommatesApi = {
  getRoommates: async (householdId: string): Promise<Roommate[]> => {
    const [membersRes, balancesRes] = await Promise.allSettled([
      apiClient.get<Array<{
        userId: string;
        username: string;
        email: string;
        role: MemberRole;
        nickname?: string;
        joinedAt?: string;
      }>>(`/households/${householdId}/members`),
      apiClient.get<{
        currency?: string;
        members?: Array<{
          userId: string;
          netBalance?: number;
        }>;
      }>(`/households/${householdId}/balances`),
    ]);

    const membersData = membersRes.status === 'fulfilled' ? membersRes.value.data : [];
    const balancesData = balancesRes.status === 'fulfilled' ? balancesRes.value.data : { members: [] };

    const balanceMap = new Map<string, number>();
    if (balancesData?.members) {
      for (const b of balancesData.members) {
        balanceMap.set(b.userId, Number(b.netBalance || 0));
      }
    }

    return membersData.map((m, idx) => ({
      id: m.userId,
      name: m.nickname || m.username,
      email: m.email,
      avatarInitial: (m.nickname || m.username).charAt(0).toUpperCase(),
      avatarColor: idx % 2 === 0 ? 'oak' : 'sage',
      balance: balanceMap.get(m.userId) ?? 0,
      currency: balancesData?.currency || 'MAD',
      role: m.role || 'MEMBER',
      joinDate: m.joinedAt,
    }));
  },

  createDirectInvite: async (
    householdId: string,
    dto: CreateDirectInviteDto
  ): Promise<HouseholdInviteSummary> => {
    const { data } = await apiClient.post<HouseholdInviteSummary>(
      `/households/${householdId}/invites/direct`,
      dto
    );
    return data;
  },

  createLinkInvite: async (
    householdId: string,
    dto: CreateLinkInviteDto = {}
  ): Promise<HouseholdInviteSummary> => {
    const { data } = await apiClient.post<HouseholdInviteSummary>(
      `/households/${householdId}/invites/link`,
      dto
    );
    return data;
  },

  getHouseholdInvites: async (
    householdId: string
  ): Promise<HouseholdInviteSummary[]> => {
    const { data } = await apiClient.get<HouseholdInviteSummary[]>(
      `/households/${householdId}/invites`
    );
    return data;
  },

  revokeInvite: async (
    householdId: string,
    inviteId: string
  ): Promise<{ success: boolean }> => {
    await apiClient.delete(`/households/${householdId}/invites/${inviteId}`);
    return { success: true };
  },

  inviteRoommate: async (
    householdId: string,
    dto: InviteRoommateDto
  ): Promise<{ inviteId: string; inviteUrl: string }> => {
    try {
      const { data } = await apiClient.post<HouseholdInviteSummary>(
        `/households/${householdId}/invites/direct`,
        {
          username: dto.name || dto.email,
          validDays: 7,
        }
      );
      const code = data?.code || data?.inviteId || '';
      return {
        inviteId: data?.inviteId || code,
        inviteUrl: `${window.location.origin}/invite/${code}`,
      };
    } catch {
      const { data } = await apiClient.post<HouseholdInviteSummary>(
        `/households/${householdId}/invites/link`,
        {
          maxUses: 10,
          validDays: 7,
        }
      );
      const code = data?.code || data?.inviteId || '';
      return {
        inviteId: data?.inviteId || code,
        inviteUrl: `${window.location.origin}/invite/${code}`,
      };
    }
  },

  getSettlementMatrix: async (householdId: string): Promise<DirectSettlementPath[]> => {
    const { data } = await apiClient.get<{
      currency?: string;
      simplifiedDebts?: Array<{
        fromUserId: string;
        fromUsername: string;
        toUserId: string;
        toUsername: string;
        amount: number;
      }>;
    }>(`/households/${householdId}/balances`);

    const debts = data?.simplifiedDebts || [];
    const currency = data?.currency || 'MAD';

    return debts.map((d, idx) => ({
      id: `matrix-${d.fromUserId}-${d.toUserId}`,
      debtorName: d.fromUsername,
      debtorAvatar: (d.fromUsername || 'U').charAt(0).toUpperCase(),
      debtorColor: idx % 2 === 0 ? 'oak' : 'sage',
      creditorName: d.toUsername,
      amount: Number(d.amount),
      currency,
      contextText: 'Calculated optimal settlement transfer',
    }));
  },

  updateMemberRole: async (
    householdId: string,
    memberId: string,
    role: MemberRole
  ): Promise<{ success: boolean }> => {
    await apiClient.put(`/households/${householdId}/members/${memberId}`, { role });
    return { success: true };
  },

  kickMember: async (
    householdId: string,
    memberId: string
  ): Promise<{ success: boolean }> => {
    await apiClient.delete(`/households/${householdId}/members/${memberId}`);
    return { success: true };
  },

  settleMemberBalance: async (
    householdId: string,
    memberId: string,
    amount: number,
    paymentMethod: string
  ): Promise<{ success: boolean }> => {
    await apiClient.post(`/households/${householdId}/settlements`, {
      recipientUserId: memberId,
      amount,
      notes: paymentMethod,
      settledAt: new Date().toISOString(),
    });
    return { success: true };
  },
};
