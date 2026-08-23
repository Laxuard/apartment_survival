import type { Role } from '@/types';

export interface BackendHouseholdSummary {
  householdId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  currency: string;
  timezone?: string;
  memberCount: number;
  archived: boolean;
  createdAt: string;
}

export interface BackendMemberSummary {
  userId: string;
  username: string;
  email: string;
  role: Role;
  nickname?: string;
  joinedAt: string;
}

export interface BackendHouseholdDetail {
  householdId: string;
  name: string;
  description?: string;
  avatarUrl?: string;
  currency: string;
  timezone?: string;
  maxMembers: number;
  archived: boolean;
  members: BackendMemberSummary[];
  createdAt: string;
}

export interface CreateHouseholdDto {
  name: string;
  currency?: string;
  timezone?: string;
  maxMembers?: number;
}

export interface JoinWithCodeDto {
  code: string;
}

export interface UserInboxInvite {
  inviteId: string;
  householdId: string;
  householdName: string;
  inviterName: string;
  invitedAt: string;
}
