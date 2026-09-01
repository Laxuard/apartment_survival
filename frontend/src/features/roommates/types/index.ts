export type MemberRole = 'ADMIN' | 'MEMBER';

export interface Roommate {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  avatarColor: 'oak' | 'sage';
  balance: number; // positive = owes you / credit, negative = you owe them / debt, 0 = settled
  currency: string;
  role: MemberRole;
  isCurrentUser?: boolean;
  joinDate?: string;
  overdueDays?: number;
  pendingDays?: number;
  pendingReason?: string;
}

export interface DirectSettlementPath {
  id: string;
  debtorName: string;
  debtorAvatar: string;
  debtorColor: 'oak' | 'sage';
  creditorName: string;
  amount: number;
  currency: string;
  contextText: string;
}

export type InviteChannel = 'link' | 'qr' | 'direct';

export interface InviteRoommateDto {
  name: string;
  email: string;
  role: MemberRole;
}

export interface HouseholdInviteSummary {
  inviteId: string;
  type: 'DIRECT' | 'LINK';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED' | 'EXPIRED';
  code: string;
  targetUsername?: string;
  maxUses?: number;
  usedCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface CreateDirectInviteDto {
  username: string;
  validDays?: number;
}

export interface CreateLinkInviteDto {
  maxUses?: number;
  validDays?: number;
}

