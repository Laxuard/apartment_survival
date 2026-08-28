import type { User, HouseholdMembership } from '@/types';
import type { Roommate, DirectSettlementPath } from '@/features/roommates/types';
import type { Expense, ExpenseCategory } from '@/features/expenses/types';
import type { PantryItem } from '@/features/pantry/types';
import type { Bill } from '@/features/bills/types';

/**
 * ============================================================================
 * Centralized Mock Repository
 * Single source of truth for mock data used for offline dev, demos, & testing
 * ============================================================================
 */

export const MOCK_CURRENT_USER: User = {
  id: 'user-1',
  name: 'Laxuard',
  email: 'laxuard@apartment4b.com',
};

export const MOCK_HOUSEHOLDS: HouseholdMembership[] = [
  {
    id: 'apt-4b',
    name: 'Apartment 4B',
    role: 'ADMIN',
    currency: 'MAD',
    description: '3-Bedroom Shared Flat in Maarif',
    monthlyBudget: 6000,
    capacity: 4,
    wifiSsid: 'Apartment4B_5G',
    wifiPassword: 'olive_oil_2026',
    splitAlgorithm: 'DEBT_SIMPLIFIED',
    autoRestockFromExpenses: true,
    memberCount: 3,
  },
  {
    id: 'summer-flat',
    name: 'Summer Beach Flat',
    role: 'MEMBER',
    currency: 'MAD',
    description: 'Coastal Getaway House',
    monthlyBudget: 4500,
    capacity: 6,
    wifiSsid: 'BeachGuest_WiFi',
    wifiPassword: 'sunset_summer',
    splitAlgorithm: 'DIRECT',
    autoRestockFromExpenses: false,
    memberCount: 4,
  },
];

export const MOCK_ROOMMATES: Roommate[] = [
  {
    id: 'user-1',
    name: 'Laxuard',
    email: 'laxuard@apartment4b.com',
    avatarInitial: 'L',
    avatarColor: 'oak',
    balance: 450.0,
    currency: 'MAD',
    role: 'ADMIN',
    isCurrentUser: true,
    joinDate: 'Space Creator',
  },
  {
    id: 'user-bob',
    name: 'Bob',
    email: 'bob@apartment4b.com',
    avatarInitial: 'B',
    avatarColor: 'sage',
    balance: 300.0,
    currency: 'MAD',
    role: 'MEMBER',
    joinDate: 'Jan 2026',
    pendingDays: 14,
    pendingReason: 'Groceries & Olive Oil',
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
    joinDate: 'Feb 2026',
    pendingDays: 3,
    pendingReason: 'WiFi Split',
    overdueDays: 0,
  },
];

export const MOCK_SETTLEMENT_PATHS: DirectSettlementPath[] = [
  {
    id: 'settle-bob',
    debtorName: 'Bob',
    debtorAvatar: 'B',
    debtorColor: 'oak',
    creditorName: 'You',
    amount: 300.0,
    currency: 'MAD',
    contextText: '14 days pending · Groceries',
  },
  {
    id: 'settle-alice',
    debtorName: 'Alice',
    debtorAvatar: 'A',
    debtorColor: 'sage',
    creditorName: 'You',
    amount: 150.0,
    currency: 'MAD',
    contextText: '3 days pending · WiFi Split',
  },
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: 'groceries',
    description: 'Groceries',
    amount: 80.0,
    currency: 'MAD',
    payerId: 'user-1',
    payerName: 'Laxuard',
    category: 'GROCERIES' as ExpenseCategory,
    splitMethod: 'EQUAL',
    splits: [
      { userId: 'user-1', userName: 'Laxuard', amount: 26.68 },
      { userId: 'user-2', userName: 'Bob', amount: 26.66 },
      { userId: 'user-3', userName: 'Alice', amount: 26.66 },
    ],
    createdAt: 'today',
    userShare: 26.68,
    auditInfo: 'Logged today at 2:15 PM via Web',
  },
  {
    id: 'wifi',
    description: 'Wifi bill',
    amount: 45.0,
    currency: 'MAD',
    payerId: 'user-1',
    payerName: 'Laxuard',
    category: 'UTILITIES' as ExpenseCategory,
    splitMethod: 'EQUAL',
    splits: [
      { userId: 'user-1', userName: 'Laxuard', amount: 15.0 },
      { userId: 'user-2', userName: 'Bob', amount: 15.0 },
      { userId: 'user-3', userName: 'Alice', amount: 15.0 },
    ],
    createdAt: 'yesterday',
    userShare: 15.0,
    auditInfo: 'Logged yesterday at 9:40 AM via Web',
  },
  {
    id: 'dinner',
    description: 'Dinner',
    amount: 120.0,
    currency: 'MAD',
    payerId: 'user-bob',
    payerName: 'Bob',
    category: 'HOUSEHOLD' as ExpenseCategory,
    splitMethod: 'EQUAL',
    splits: [
      { userId: 'user-1', userName: 'Laxuard', amount: 0.0 },
      { userId: 'user-2', userName: 'Bob', amount: 60.0 },
      { userId: 'user-3', userName: 'Alice', amount: 60.0 },
    ],
    createdAt: '2 days ago',
    userShare: 0.0,
    auditInfo: 'Logged 2 days ago at 8:05 PM via Web',
  },
  {
    id: 'cleaning',
    description: 'Cleaning supplies',
    amount: 65.0,
    currency: 'MAD',
    payerId: 'user-1',
    payerName: 'Laxuard',
    category: 'HOUSEHOLD' as ExpenseCategory,
    splitMethod: 'EQUAL',
    splits: [
      { userId: 'user-1', userName: 'Laxuard', amount: 21.68 },
      { userId: 'user-2', userName: 'Bob', amount: 21.66 },
      { userId: 'user-3', userName: 'Alice', amount: 21.66 },
    ],
    createdAt: '3 days ago',
    userShare: 21.68,
    auditInfo: 'Logged 3 days ago via Web',
  },
  {
    id: 'coffee-pastries',
    description: 'Espresso beans & snacks',
    amount: 95.0,
    currency: 'MAD',
    payerId: 'user-3',
    payerName: 'Alice',
    category: 'GROCERIES' as ExpenseCategory,
    splitMethod: 'EQUAL',
    splits: [
      { userId: 'user-1', userName: 'Laxuard', amount: 31.68 },
      { userId: 'user-2', userName: 'Bob', amount: 31.66 },
      { userId: 'user-3', userName: 'Alice', amount: 31.66 },
    ],
    createdAt: '5 days ago',
    userShare: 31.68,
    auditInfo: 'Logged 5 days ago via Web',
  },
];

export interface MockBalanceItem {
  userId: string;
  userName: string;
  avatarInitial: string;
  avatarColor: string;
  netBalance: number;
  currency: string;
  status: 'owes_you' | 'you_owe' | 'settled';
  subtitle: string;
  overdueDays: number;
}

export const MOCK_BALANCES: MockBalanceItem[] = [
  {
    userId: 'user-bob',
    userName: 'Bob',
    avatarInitial: 'B',
    avatarColor: 'sage',
    netBalance: 300.0,
    currency: 'MAD',
    status: 'owes_you',
    subtitle: '14 days pending · Groceries',
    overdueDays: 14,
  },
  {
    userId: 'user-alice',
    userName: 'Alice',
    avatarInitial: 'A',
    avatarColor: 'sage',
    netBalance: 150.0,
    currency: 'MAD',
    status: 'owes_you',
    subtitle: '3 days pending · WiFi Split',
    overdueDays: 0,
  },
];

export const MOCK_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'coffee',
    name: 'Coffee beans',
    category: 'Beverages',
    status: 'out',
    badgeLabel: 'Out',
    quantity: 0,
    unit: 'bags',
    iconName: 'coffee',
    onGroceryList: true,
  },
  {
    id: 'eggs',
    name: 'Eggs',
    category: 'Dairy & Eggs',
    status: 'low',
    badgeLabel: '2 left',
    quantity: 2,
    unit: 'pcs',
    iconName: 'egg',
    onGroceryList: true,
  },
  {
    id: 'oil',
    name: 'Olive oil',
    category: 'Cooking',
    status: 'low',
    badgeLabel: 'Low',
    quantity: 1,
    unit: 'bottle',
    iconName: 'droplet',
    onGroceryList: false,
  },
];

export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill-1',
    title: 'Orange Wi-Fi',
    dueText: 'Due in 3 days · Auto-split on',
    dueDays: 3,
    amount: 250.0,
    currency: 'MAD',
    autoSplit: true,
    iconName: 'wifi',
  },
  {
    id: 'bill-2',
    title: 'Apartment rent',
    dueText: 'Due in 8 days · 1,000 MAD / person',
    dueDays: 8,
    amount: 4000.0,
    currency: 'MAD',
    autoSplit: false,
    perPersonText: '1,000 MAD / person',
    iconName: 'home',
  },
];

