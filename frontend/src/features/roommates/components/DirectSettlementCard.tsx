import { DataCard } from '@/components/ui/DataCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  IconArrowsExchange,
  IconArrowsSplit,
  IconBrandWhatsapp,
  IconCheck,
} from '@tabler/icons-react';
import React from 'react';
import type { DirectSettlementPath } from '../types';

interface DirectSettlementCardProps {
  settlementPaths: DirectSettlementPath[];
  isLoading: boolean;
  currency: string;
  splitAlgorithm?: 'DEBT_SIMPLIFIED' | 'DIRECT';
  totalNetCredit: number;
  onNudge: (debtorName: string, amount: number) => void;
  onSettlePath?: (debtorName: string) => void;
  onSettleAll: () => void;
}

export const DirectSettlementCard: React.FC<DirectSettlementCardProps> = ({
  settlementPaths,
  isLoading,
  currency,
  splitAlgorithm = 'DEBT_SIMPLIFIED',
  totalNetCredit,
  onNudge,
  onSettlePath,
  onSettleAll,
}) => {
  const isMinimalFlow = splitAlgorithm === 'DEBT_SIMPLIFIED';

  const headerAction = (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <span className="text-[10px] font-semibold text-[var(--muted)] block">
          {totalNetCredit > 0
            ? 'Total You Are Owed'
            : totalNetCredit < 0
              ? 'Total You Owe'
              : 'All Settled'}
        </span>
        <span
          className={`text-xs sm:text-sm font-bold mono ${totalNetCredit >= 0 ? 'text-[var(--positive-text)]' : 'text-[var(--negative-text)]'
            }`}
        >
          {totalNetCredit >= 0 ? '+' : ''}
          {totalNetCredit.toFixed(2)} {currency}
        </span>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-help transition-opacity hover:opacity-80 ${isMinimalFlow
              ? 'bg-[var(--sage-tint)] text-[var(--sage)]'
              : 'bg-[var(--oak-tint)] text-[var(--oak)]'
              }`}
          >
            {isMinimalFlow ? <IconArrowsExchange size={11} /> : <IconArrowsSplit size={11} />}
            {isMinimalFlow ? 'Minimal Flow' : 'Direct Pairs'}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {isMinimalFlow
            ? 'Graph debt reduction algorithm cancels circular debts across flatmates so everyone makes the minimum total payments.'
            : 'Pairwise ledger tracks individual debts directly between each flatmate without circular deduction.'}
        </TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <DataCard
      title={isMinimalFlow ? 'Debt Simplification Matrix' : 'Direct 1-to-1 Ledger'}
      headerAction={headerAction}
      isLoading={isLoading}
      isEmpty={settlementPaths.length === 0}
      skeleton={
        <div className="space-y-3 py-2 flex-1 flex flex-col justify-center">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full skeleton-warm rounded-xl" />
          ))}
        </div>
      }
      emptyState={
        <div className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center h-full">
          <div className="w-12 h-12 rounded-2xl bg-[var(--sage-tint)]/40 border border-[var(--sage)]/30 text-[var(--sage)] flex items-center justify-center mb-3 shadow-2xs">
            <IconCheck size={24} />
          </div>
          <div className="text-sm font-medium text-[var(--text)]">All accounts are squared up</div>
          <p className="text-xs text-[var(--muted)] mt-1">No complex debts to simplify right now.</p>
        </div>
      }
      className="h-full min-h-[360px] flex flex-col"
    >
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {/* Populated Settlement Path Rows */}
        <div className="space-y-2.5">
          {settlementPaths.map((path, index) => (
            <div
              key={path.id}
              style={{ animationDelay: `${index * 45}ms` }}
              className="animate-fade-up p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-colors shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`avatar-badge ${path.debtorColor} text-xs w-9 h-9 shrink-0 font-bold`}>
                  {path.debtorAvatar}
                </span>
                <div className="truncate">
                  <div className="text-xs font-bold text-[var(--text)] truncate">
                    {path.debtorName} owes {path.creditorName}
                  </div>
                  <div className="text-[10.5px] text-[var(--muted)] truncate">{path.contextText}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[var(--positive-text)] mono mr-1">
                  +{path.amount.toFixed(2)} {path.currency}
                </span>

                <button
                  type="button"
                  onClick={() => onNudge(path.debtorName, path.amount)}
                  className="btn-spring text-[11px] font-semibold px-2 py-1 rounded-lg border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Send WhatsApp debt reminder"
                >
                  <IconBrandWhatsapp size={13} />
                  <span>Nudge</span>
                </button>

                {onSettlePath && (
                  <button
                    type="button"
                    onClick={() => onSettlePath(path.debtorName)}
                    className="btn-spring text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--oak)] hover:border-[var(--oak)] hover:text-white text-[var(--text)] flex items-center gap-1 cursor-pointer transition-all shadow-2xs"
                  >
                    <span>Record Payment</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Settle Action */}
        <div className="pt-3 border-t border-[var(--border)]/40 dark:border-white/5 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[var(--muted)]">
            {isMinimalFlow ? 'Calculates circular debt reduction' : 'Pairwise balances without circular reduction'}
          </span>
          <button
            type="button"
            onClick={onSettleAll}
            disabled={settlementPaths.length === 0}
            className="btn-spring px-3.5 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--canvas)] border border-[var(--border-strong)] font-semibold text-xs text-[var(--text)] cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-white/5"
          >
            Settle All Debts
          </button>
        </div>
      </div>
    </DataCard>
  );
};
