import React from 'react';
import { IconPlus, IconTrendingUp, IconArrowsExchange } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMoney, formatSignedMoney } from '@/domain';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdLedger } from '@/features/roommates';

interface HeroBalanceProps {
  amount?: number;
  currency?: string;
  lentAmount?: number;
  borrowedAmount?: number;
}

export const HeroBalance: React.FC<HeroBalanceProps> = ({
  amount: propAmount,
  currency: customCurrency,
  lentAmount: propLent,
  borrowedAmount: propBorrowed,
}) => {
  const { openModal, openSettleModal } = useUIStore();
  const ledger = useHouseholdLedger(customCurrency);

  const finalAmount = propAmount !== undefined ? propAmount : ledger.userNetBalance;
  const finalLent = propLent !== undefined ? propLent : ledger.totalLent;
  const finalBorrowed = propBorrowed !== undefined ? propBorrowed : ledger.totalBorrowed;
  const formattedAmount = `${finalAmount > 0 ? '+' : ''}${finalAmount.toFixed(2)}`;

  const totalFlow = finalLent + finalBorrowed;
  const lentPct = totalFlow > 0 ? Math.round((finalLent / totalFlow) * 100) : 50;

  return (
    <div className="rounded-3xl border border-[var(--border-strong)] bg-gradient-to-r from-[var(--oak-tint)] via-[var(--card)] to-[var(--sage-tint)]/70 p-6 sm:p-7 relative overflow-hidden shadow-md shrink-0 before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-[var(--oak)] before:via-[var(--border-strong)] before:to-[var(--sage)] select-none">
      {/* 1. Header Row inside Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-2 border-b border-[var(--border)]/60">
        <div className="flex items-center gap-2.5">
          <span className="uppercase tracking-wider text-xs font-bold text-[var(--muted)]">
            {ledger.statusLabel}
          </span>
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-0.5 shadow-2xs">
            <IconTrendingUp size={13} />
            <span>Healthy Ledger</span>
          </Badge>
        </div>

        <span className="text-xs text-[var(--muted)] hidden sm:inline-block font-medium">
          {finalAmount > 0
            ? `${lentPct}% in your favor`
            : finalAmount === 0
            ? 'All flat accounts settled'
            : 'Open debt pending'}
        </span>
      </div>

      {/* 2. Main Content Row: Metric (Left) + Center Flow Panel (Center) + Actions (Right) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Financial Metric */}
        <div className="space-y-1 min-w-0 lg:w-1/3">
          <div className="flex items-baseline gap-2.5">
            <span
              className={`mono font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl ${
                finalAmount > 0
                  ? 'text-[var(--positive-text)]'
                  : finalAmount < 0
                  ? 'text-[var(--negative-text)]'
                  : 'text-[var(--text)]'
              }`}
            >
              {formattedAmount}
            </span>
            <span className="font-normal text-sm sm:text-base text-[var(--muted)]">{ledger.currency}</span>
          </div>
          <div className="text-xs text-[var(--muted)] font-medium">
            Net balance across active flatmates
          </div>
        </div>

        {/* Center Flow Sparkline Panel */}
        <div className="w-full lg:max-w-sm space-y-2 shrink-0">
          <div className="flex justify-between text-xs text-[var(--muted)] font-mono px-0.5">
            <span className="text-[var(--sage)] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--sage)] inline-block shadow-2xs" />
              Lent: {formatSignedMoney(finalLent, ledger.currency)}
            </span>
            <span className="text-[var(--oak)] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--oak)] inline-block shadow-2xs" />
              Borrowed: {formatMoney(finalBorrowed, ledger.currency)}
            </span>
          </div>
          <div className="h-3 w-full bg-[var(--canvas)] border border-[var(--border-strong)] rounded-full overflow-hidden flex shadow-inner">
            {totalFlow === 0 ? (
              <div className="bg-[var(--border-strong)] h-full w-full opacity-60" title="Settled" />
            ) : (
              <>
                <div
                  className="bg-gradient-to-r from-[var(--sage)] to-[#7BC098] h-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${lentPct}%` }}
                  title={`Lent: ${lentPct}%`}
                />
                <div
                  className="bg-gradient-to-r from-[var(--oak)] to-[var(--oak-hover)] h-full transition-all duration-500 ease-out shadow-sm"
                  style={{ width: `${100 - lentPct}%` }}
                  title={`Borrowed: ${100 - lentPct}%`}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Quick Actions */}
        <div className="flex items-center justify-start lg:justify-end gap-3 shrink-0 lg:w-1/3">
          <Button
            onClick={() => openModal('expense')}
            size="lg"
          >
            <IconPlus size={17} aria-hidden="true" />
            <span>Log expense</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => openSettleModal()}
          >
            <IconArrowsExchange size={17} aria-hidden="true" className="text-[var(--muted)]" />
            <span>Record payment</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
