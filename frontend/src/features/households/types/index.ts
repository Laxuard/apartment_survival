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
  description?: string;
  currency?: string;
  timezone?: string;
  maxMembers?: number;
}

export interface UpdateHouseholdDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
  currency?: string;
  timezone?: string;
  maxMembers?: number;
}

export interface UpdateMemberDto {
  role: Role;
  nickname?: string;
}

export interface JoinWithCodeDto {
  code: string;
}

export interface CreateLinkInviteDto {
  maxUses?: number;
  validDays?: number;
}

export interface CreateDirectInviteDto {
  username: string;
  validDays?: number;
}

export type InviteType = 'LINK' | 'DIRECT_USER';
export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface HouseholdInviteSummary {
  inviteId: string;
  type: InviteType;
  status: InviteStatus;
  code?: string;
  targetUsername?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface UserInboxInvite {
  inviteId: string;
  householdId: string;
  householdName: string;
  householdDescription?: string;
  invitedByUsername?: string;
  inviterName?: string;
  expiresAt?: string;
  createdAt?: string;
  invitedAt?: string;
}
