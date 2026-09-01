export type RecurringBillCategory = 'RENT' | 'UTILITIES' | 'MAINTENANCE' | 'OTHER';

export interface RecurringBill {
  id: string;
  householdId: string;
  title: string;
  amount: number;
  currency?: string;
  category: RecurringBillCategory;
  dueDayOfMonth: number; // 1 to 31
  responsiblePayerId: string;
  responsiblePayerName?: string;
  splitStrategy: 'EQUAL';
  lastPaidPeriod?: string; // e.g. "2026-09"
  iconName?: string;
  createdAt?: string;
}

export interface CreateRecurringBillDto {
  title: string;
  amount: number;
  category: RecurringBillCategory;
  dueDayOfMonth: number;
  responsiblePayerId: string;
  splitStrategy?: 'EQUAL';
  iconName?: string;
}

export interface Bill {
  id: string;
  title: string;
  dueText: string;
  dueDays: number;
  amount: number;
  currency: string;
  autoSplit: boolean;
  perPersonText?: string;
  iconName: 'wifi' | 'home' | 'bolt' | 'water' | string;
  isPaid?: boolean;
  category?: RecurringBillCategory;
  dueDayOfMonth?: number;
  responsiblePayerId?: string;
  responsiblePayerName?: string;
  lastPaidPeriod?: string;
}

export interface CreateBillDto {
  title: string;
  amount: number;
  dueDays: number;
  autoSplit?: boolean;
  iconName?: 'wifi' | 'home' | 'bolt' | 'water' | string;
  category?: RecurringBillCategory;
  dueDayOfMonth?: number;
  responsiblePayerId?: string;
}

