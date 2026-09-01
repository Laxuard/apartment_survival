import { useMemo } from 'react';
import { formatMoney, formatSignedMoney } from '@/domain';
import { useActiveHousehold } from '@/features/households';
import { useAuthStore } from '@/stores/useAuthStore';
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
  const { activeHousehold, activeHouseholdId, activeCurrency } = useActiveHousehold();
  const currency = customCurrency || activeCurrency;
  const authUser = useAuthStore((s) => s.user);

  const { data: rawMembers = [], isLoading } = useRoommatesQuery(activeHouseholdId, currency);

  return useMemo(() => {
    // 1. Tag and deduplicate all members
    const allMembers = rawMembers.map((r) => {
      const isCurrent = Boolean(
        r.isCurrentUser ||
        (authUser?.id && r.id === authUser.id) ||
        (authUser?.email && r.email && r.email.toLowerCase() === authUser.email.toLowerCase()) ||
        (authUser?.name && r.name && r.name.toLowerCase() === authUser.name.toLowerCase())
      );
      return isCurrent ? { ...r, isCurrentUser: true } : r;
    });

    // 2. Separate current user and peers
    const currentUser = allMembers.find((r) => r.isCurrentUser) || null;
    const peers = allMembers.filter((r) => {
      if (r.isCurrentUser) return false;
      if (authUser?.id && r.id === authUser.id) return false;
      if (authUser?.email && r.email && r.email.toLowerCase() === authUser.email.toLowerCase()) return false;
      if (authUser?.name && r.name && r.name.toLowerCase() === authUser.name.toLowerCase()) return false;
      return true;
    });

    // 2. Peer Debt Categories
    // In the accounting ledger: balance < 0 means debtor (owes money), balance > 0 means creditor (is owed money)
    const debtorPeers = peers.filter((r) => r.balance < -0.001);
    const creditorPeers = peers.filter((r) => r.balance > 0.001);
    const settledPeers = peers.filter((r) => Math.abs(r.balance) <= 0.001);
    const overduePeers = peers.filter((r) => (r.overdueDays ?? 0) > 0 && r.balance < -0.001);

    // 3. Mathematical Ledger Aggregations for Current User
    const userNetBalance = currentUser ? currentUser.balance : 0;

    const isOwedMoney = userNetBalance > 0.001;
    const isOwingMoney = userNetBalance < -0.001;
    const isAllSettled = Math.abs(userNetBalance) <= 0.001;

    // Total Lent = Amount current user has fronted to flatmates (when userNetBalance > 0)
    // Total Borrowed = Amount current user owes to flatmates (when userNetBalance < 0)
    const totalLent = isOwedMoney ? userNetBalance : 0;
    const totalBorrowed = isOwingMoney ? Math.abs(userNetBalance) : 0;

    // 4. Progress / Distribution Percentage
    const lentPercentage = isOwedMoney ? 100 : isOwingMoney ? 0 : 50;

    // 5. Formatted Nudge String
    const nudgeSummary =
      debtorPeers.length > 0
        ? debtorPeers
            .map(
              (r) =>
                `${r.name} owes ${formatMoney(Math.abs(r.balance), currency)}${
                  r.overdueDays ? ` (${r.overdueDays}d overdue)` : ''
                }`
            )
            .join(' · ')
        : isAllSettled
        ? 'All flatmates are settled up!'
        : 'All debts are settled!';

    // 6. Human-readable Status Label
    const statusLabel = isAllSettled
      ? 'All accounts are completely settled'
      : isOwedMoney
      ? 'Total You Are Owed'
      : 'Total You Owe';

    const formattedNetBalance = formatSignedMoney(userNetBalance, currency, { showCode: false });


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
  }, [rawMembers, authUser, isLoading, currency, activeHousehold?.capacity]);
};

