import type { SplitAlgorithm, SplitMethod } from '@/domain';

export type Role = 'ADMIN' | 'MEMBER';
export type { SplitAlgorithm, SplitMethod };

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface HouseholdMembership {
  id: string;
  name: string;
  role: Role;
  currency: string;
  description?: string;
  monthlyBudget?: number;
  capacity?: number;
  wifiSsid?: string;
  wifiPassword?: string;
  splitAlgorithm?: SplitAlgorithm;
  defaultSplitMethod?: SplitMethod;
  defaultSplitAllocations?: Record<string, number>;
  autoRestockFromExpenses?: boolean;
  memberCount: number;
}

