export interface Roommate {
  id: string;
  name: string;
  email: string;
  avatarInitial: string;
  avatarColor: 'oak' | 'sage';
  balance: number; // positive = owes you, negative = you owe them
  currency: string;
  role: 'ADMIN' | 'MEMBER';
  overdueDays?: number;
}

export interface InviteRoommateDto {
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
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
