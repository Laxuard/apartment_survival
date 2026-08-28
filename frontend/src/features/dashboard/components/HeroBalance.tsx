import React from 'react';
import { IconPlus, IconArrowsExchange, IconTrendingUp, IconUsers } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useRoommatesQuery } from '@/features/roommates';

interface HeroBalanceProps {
  amount?: number;
  currency?: string;
  isOwed?: boolean;
  lentAmount?: number;
  borrowedAmount?: number;
  nudgeText?: string;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  amount: propAmount,
  currency: customCurrency,
  isOwed: propIsOwed,
  lentAmount: propLent,
  borrowedAmount: propBorrowed,
  nudgeText: propNudge,
}) => {
  const { openModal } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveCurrency } = useHouseholdStore();
  const currency = customCurrency || getActiveCurrency();

  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);

  // Derive dynamic lending & borrowing sums from roommate balances if props not explicitly provided
  const owingRoommates = roommates.filter((r) => r.balance > 0);
  const owedRoommates = roommates.filter((r) => r.balance < 0);

  const dynamicLent = owingRoommates.reduce((acc, curr) => acc + curr.balance, 0);
  const dynamicBorrowed = owedRoommates.reduce((acc, curr) => acc + Math.abs(curr.balance), 0);
  const dynamicNet = dynamicLent - dynamicBorrowed;

  const finalAmount = propAmount !== undefined ? propAmount : dynamicNet;
  const finalLent = propLent !== undefined ? propLent : dynamicLent;
  const finalBorrowed = propBorrowed !== undefined ? propBorrowed : dynamicBorrowed;
  const finalIsOwed = propIsOwed !== undefined ? propIsOwed : finalAmount >= 0;

  // Dynamically compute the nudge text from live roommates
  const dynamicNudge =
    owingRoommates.length > 0
      ? owingRoommates
          .map(
            (r) =>
              `${r.name} owes ${r.balance.toFixed(2)} ${currency}${
                r.overdueDays ? ` (${r.overdueDays}d overdue)` : ''
              }`
          )
          .join(' · ')
      : finalAmount < 0
      ? 'All your flatmates are settled up!'
      : 'All debts are settled!';

  const displayNudge = propNudge || dynamicNudge;
  const formattedAmount = `${finalAmount > 0 ? '+' : ''}${finalAmount.toFixed(2)}`;

  // Calculate distribution percentages for visual bar
  const totalFlow = finalLent + finalBorrowed;
  const lentPct = totalFlow > 0 ? Math.round((finalLent / totalFlow) * 100) : 50;

  return (
    <div className="hero-card relative overflow-hidden transition-all duration-200">
      <div className="hero-left flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="hero-label uppercase tracking-wider text-[11px] font-semibold text-[var(--muted)]">
            Net balance
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--sage-tint)] text-[var(--sage)]">
            <IconTrendingUp size={13} />
            Healthy Ledger
          </span>
        </div>

        <div
          className={`hero-amount mono font-bold tracking-tight text-3xl sm:text-4xl ${
            finalAmount > 0
              ? 'text-[var(--positive-text)]'
              : finalAmount < 0
              ? 'text-[var(--negative-text)]'
              : 'text-[var(--text)]'
          }`}
        >
          {formattedAmount}
          <span className="currency font-normal text-xs ml-1.5 text-[var(--muted)]">{currency}</span>
        </div>

        <div className="hero-sub flex items-center gap-2 text-xs font-medium text-[var(--muted)]">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              finalAmount === 0
                ? 'bg-[var(--muted)]'
                : finalIsOwed
                ? 'bg-[var(--sage)]'
                : 'bg-[var(--oak)]'
            } animate-pulse`}
            aria-hidden="true"
          />
          {finalAmount === 0
            ? 'All accounts are completely settled'
            : finalIsOwed
            ? 'You are owed money in total'
            : 'You owe money in total'}
        </div>

        {/* Visual Ledger Distribution Bar */}
        <div className="pt-2 max-w-sm space-y-1.5">
          <div className="flex justify-between text-[11px] text-[var(--muted)]">
            <span className="text-[var(--sage)] font-medium">
              Lent: +{finalLent.toFixed(2)} {currency}
            </span>
            <span className="text-[var(--oak)] font-medium">
              Borrowed: {finalBorrowed.toFixed(2)} {currency}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden flex">
            {totalFlow === 0 ? (
              <div className="bg-[var(--border-strong)] h-full w-full opacity-60" title="Settled" />
            ) : (
              <>
                <div
                  className="bg-[var(--sage)] h-full transition-all duration-500 ease-out"
                  style={{ width: `${lentPct}%` }}
                  title={`Lent: ${lentPct}%`}
                />
                <div
                  className="bg-[var(--oak)] h-full transition-all duration-500 ease-out"
                  style={{ width: `${100 - lentPct}%` }}
                  title={`Borrowed: ${100 - lentPct}%`}
                />
              </>
            )}
          </div>
        </div>

        {displayNudge && (
          <div className="hero-nudge text-xs text-[var(--muted)] border-t border-[var(--border)] pt-2.5 mt-2 flex items-center gap-1.5">
            <IconUsers size={14} className="text-[var(--oak)] shrink-0" />
            <span className="truncate">{displayNudge}</span>
          </div>
        )}
      </div>

      <div className="hero-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-end sm:self-center">
        <Button
          onClick={() => openModal('expense')}
          className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-semibold shadow-sm cursor-pointer px-4 py-2"
        >
          <IconPlus size={16} aria-hidden="true" className="mr-1.5" />
          <span>Log expense</span>
        </Button>

        <Button
          variant="outline"
          onClick={() => openModal('settle')}
          className="btn-tactile border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--sage-tint)] text-[var(--text)] cursor-pointer px-4 py-2"
        >
          <IconArrowsExchange size={16} aria-hidden="true" className="mr-1.5 text-[var(--sage)]" />
          <span>Settle up</span>
        </Button>
      </div>
    </div>
  );
};
