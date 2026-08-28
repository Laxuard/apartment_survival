import React from 'react';
import {
  IconArrowsExchange,
  IconArrowsSplit,
  IconBrandWhatsapp,
  IconCheck,
} from '@tabler/icons-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
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

  return (
    <div className="card-custom p-5 sm:p-6 flex flex-col justify-between space-y-5 h-full">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[var(--text)]">
              {isMinimalFlow ? 'Debt Simplification Matrix' : 'Direct 1-to-1 Ledger'}
            </h2>

            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full cursor-help transition-opacity hover:opacity-80 ${
                    isMinimalFlow
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
          <p className="text-[11px] text-[var(--muted)] mt-0.5">
            {isMinimalFlow
              ? 'Active balances simplified to clear debts in the fewest transfers.'
              : 'Direct pairwise debt tabs between individual roommates.'}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-[var(--muted)] block">
            {totalNetCredit > 0
              ? 'Total You Are Owed'
              : totalNetCredit < 0
              ? 'Total You Owe'
              : 'All Settled'}
          </span>
          <span
            className={`text-sm font-bold mono ${
              totalNetCredit >= 0 ? 'text-[var(--positive-text)]' : 'text-[var(--negative-text)]'
            }`}
          >
            {totalNetCredit >= 0 ? '+' : ''}
            {totalNetCredit.toFixed(2)} {currency}
          </span>
        </div>
      </div>

      {/* Debt List / Empty State */}
      <div className="space-y-2.5 flex-1">
        {isLoading ? (
          <div className="text-xs text-[var(--muted)] text-center py-6">Calculating debt flow...</div>
        ) : settlementPaths.length === 0 ? (
          <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-center gap-2 text-xs font-semibold text-[var(--positive-text)]">
            <IconCheck size={16} />
            <span>All apartment tabs are currently settled up!</span>
          </div>
        ) : (
          settlementPaths.map((path) => (
            <div
              key={path.id}
              className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-colors"
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
          ))
        )}
      </div>

      {/* Footer Settle Action */}
      <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
        <span className="text-[11px] text-[var(--muted)]">
          {isMinimalFlow ? 'Calculates circular debt reduction' : 'Pairwise balances without circular reduction'}
        </span>
        <button
          type="button"
          onClick={onSettleAll}
          disabled={settlementPaths.length === 0}
          className="btn-spring px-3.5 py-1.5 rounded-xl bg-[var(--card)] hover:bg-[var(--canvas)] border border-[var(--border-strong)] font-semibold text-xs text-[var(--text)] cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Settle All Debts
        </button>
      </div>
    </div>
  );
};
