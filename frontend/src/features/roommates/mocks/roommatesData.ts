import type { Roommate } from '../types';

export const MOCK_ROOMMATES: Roommate[] = [
  {
    id: 'user-bob',
    name: 'Bob',
    email: 'bob@apartment4b.com',
    avatarInitial: 'B',
    avatarColor: 'sage',
    balance: 300.0,
    currency: 'MAD',
    role: 'MEMBER',
    overdueDays: 14,
  },
  {
    id: 'user-alice',
    name: 'Alice',
    email: 'alice@apartment4b.com',
    avatarInitial: 'A',
    avatarColor: 'sage',
    balance: 150.0,
    currency: 'MAD',
    role: 'MEMBER',
  },
];
