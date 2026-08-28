import { useMemo } from 'react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useRoommatesQuery } from './useRoommatesQueries';
import type { Roommate } from '../types';

export interface HouseholdLedger {
  // Raw Data
  allMembers: Roommate[];
  peers: Roommate[];
  currentUser: Roommate | null;

  // Key Aggregated Metrics
  userNetBalance: number;
  totalLent: number;
  totalBorrowed: number;
  lentPercentage: number;

  // Segmented Peer Lists (Guaranteed to exclude currentUser)
  debtorPeers: Roommate[];
  creditorPeers: Roommate[];
  settledPeers: Roommate[];
  overduePeers: Roommate[];

  // Formatted Strings & Badges
  nudgeSummary: string;
  statusLabel: string;
  formattedNetBalance: string;

  // Status Invariants
  isOwedMoney: boolean;
  isOwingMoney: boolean;
  isAllSettled: boolean;
  isLoading: boolean;
  currency: string;
  memberCount: number;
  capacity: number;
  openSlots: number;
}

/**
 * Universal Single Source of Truth for Household Balances and Roommate Ledger.
 * Enforces mathematical invariants across the entire app so components never
 * have to manually filter, reduce, or double-count the logged-in user.
 */
export const useHouseholdLedger = (customCurrency?: string): HouseholdLedger => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const currency = customCurrency || getActiveCurrency();

  const { data: allMembers = [], isLoading } = useRoommatesQuery(activeHouseholdId, currency);

  return useMemo(() => {
    // 1. Separate current user and peers
    const currentUser = allMembers.find((r) => r.isCurrentUser) || null;
    const peers = allMembers.filter((r) => !r.isCurrentUser);

    // 2. Peer Debt Categories
    const debtorPeers = peers.filter((r) => r.balance > 0);
    const creditorPeers = peers.filter((r) => r.balance < 0);
    const settledPeers = peers.filter((r) => r.balance === 0);
    const overduePeers = peers.filter((r) => (r.overdueDays ?? 0) > 0 && r.balance > 0);

    // 3. Mathematical Ledger Aggregations
    const totalLent = debtorPeers.reduce((acc, r) => acc + r.balance, 0);
    const totalBorrowed = creditorPeers.reduce((acc, r) => acc + Math.abs(r.balance), 0);

    // Primary Net Balance: Always equal to totalLent - totalBorrowed (or currentUser.balance)
    const userNetBalance = currentUser ? currentUser.balance : totalLent - totalBorrowed;

    // 4. Progress / Distribution Percentage
    const totalFlow = totalLent + totalBorrowed;
    const lentPercentage = totalFlow > 0 ? Math.round((totalLent / totalFlow) * 100) : 50;

    // 5. Invariant Status Flags
    const isOwedMoney = userNetBalance > 0.001;
    const isOwingMoney = userNetBalance < -0.001;
    const isAllSettled = Math.abs(userNetBalance) <= 0.001;

    // 6. Formatted Nudge String
    const nudgeSummary =
      debtorPeers.length > 0
        ? debtorPeers
            .map(
              (r) =>
                `${r.name} owes ${r.balance.toFixed(2)} ${currency}${
                  r.overdueDays ? ` (${r.overdueDays}d overdue)` : ''
                }`
            )
            .join(' · ')
        : isAllSettled
        ? 'All flatmates are settled up!'
        : 'All debts are settled!';

    // 7. Human-readable Status Label
    const statusLabel = isAllSettled
      ? 'All accounts are completely settled'
      : isOwedMoney
      ? 'Total You Are Owed'
      : 'Total You Owe';

    const formattedNetBalance = `${userNetBalance > 0 ? '+' : ''}${userNetBalance.toFixed(2)}`;

    // 8. Capacity Metrics
    const capacity = activeHousehold?.capacity ?? 4;
    const memberCount = allMembers.length;
    const openSlots = Math.max(0, capacity - memberCount);

    return {
      allMembers,
      peers,
      currentUser,
      userNetBalance,
      totalLent,
      totalBorrowed,
      lentPercentage,
      debtorPeers,
      creditorPeers,
      settledPeers,
      overduePeers,
      nudgeSummary,
      statusLabel,
      formattedNetBalance,
      isOwedMoney,
      isOwingMoney,
      isAllSettled,
      isLoading,
      currency,
      memberCount,
      capacity,
      openSlots,
    };
  }, [allMembers, isLoading, currency, activeHousehold?.capacity]);
};

