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
