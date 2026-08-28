import React from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  IconCheck,
  IconX,
  IconArrowsExchange,
  IconCoins,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import type { DirectSettlementPath } from '../types';

interface BatchSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementPaths: DirectSettlementPath[];
  currency: string;
  onConfirmBatchSettle: () => void;
}

export const BatchSettlementModal: React.FC<BatchSettlementModalProps> = ({
  isOpen,
  onClose,
  settlementPaths,
  currency,
  onConfirmBatchSettle,
}) => {
  if (!isOpen) return null;

  const totalClearedAmount = settlementPaths.reduce((acc, p) => acc + p.amount, 0);

  const handleConfirm = () => {
    confetti({
      particleCount: 85,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#C1793D', '#6B7A5E', '#E0954F', '#7CC199'],
    });

    toast.success('All apartment tabs settled!', {
      description: `Reconciled ${totalClearedAmount.toFixed(2)} ${currency} across ${settlementPaths.length} transfers.`,
    });

    onConfirmBatchSettle();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="card-custom max-w-lg w-full p-6 space-y-5 shadow-2xl border border-[var(--border-strong)] animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center">
              <IconArrowsExchange size={20} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[var(--text)]">
                Batch Settle All Debts
              </h3>
              <p className="text-[11px] text-[var(--muted)]">
                Reconcile all {settlementPaths.length} active apartment transfers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg border border-[var(--border)] hover:bg-[var(--canvas)] flex items-center justify-center text-xs text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <IconX size={15} />
          </button>
        </div>

        {/* Transfer Paths Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--text)]">Reconciliation Transfers</div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {settlementPaths.map((path) => (
              <div
                key={path.id}
                className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`avatar-badge ${path.debtorColor} text-[11px] w-7 h-7 font-bold shrink-0`}>
                    {path.debtorAvatar}
                  </span>
                  <div className="truncate">
                    <span className="font-bold text-[var(--text)]">{path.debtorName}</span>
                    <span className="text-[var(--muted)]"> pays </span>
                    <span className="font-bold text-[var(--text)]">{path.creditorName}</span>
                  </div>
                </div>
                <div className="font-bold mono text-[var(--positive-text)] shrink-0">
                  {path.amount.toFixed(2)} {path.currency}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total Summary */}
        <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border-strong)] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <IconCoins size={16} className="text-[var(--oak)]" />
            <span>Total Debt Cleared:</span>
          </div>
          <div className="text-base font-bold mono text-[var(--positive-text)]">
            {totalClearedAmount.toFixed(2)} {currency}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--canvas)] border border-[var(--border)] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold px-5 py-2 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <IconCheck size={15} />
            <span>Confirm & Settle All Tabs</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
