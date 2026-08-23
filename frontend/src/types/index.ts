/**
 * Global Shared Domain Types
 */

export type Role = 'ADMIN' | 'MEMBER';

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
  memberCount: number;
}
