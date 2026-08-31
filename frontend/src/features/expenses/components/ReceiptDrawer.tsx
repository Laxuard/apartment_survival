import React, { useState } from 'react';
import { toast } from 'sonner';
import { IconReceipt, IconCheck, IconShare } from '@tabler/icons-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '@/features/expenses/hooks/useExpensesQueries';
import { useRoommatesQuery } from '@/features/roommates';
import type { ExpenseSplit } from '@/features/expenses/types';

export const ReceiptDrawer: React.FC = () => {
  const { activeReceiptId, closeReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveCurrency } = useHouseholdStore();
  const activeCurrency = getActiveCurrency();
  const [copied, setCopied] = useState(false);

  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, activeCurrency);

  const expense = expenses.find((e) => e.id === activeReceiptId);

  const handleCopyLink = () => {
    if (!activeReceiptId) return;
    navigator.clipboard.writeText(`${window.location.origin}/expenses?id=${activeReceiptId}`);
    setCopied(true);
    toast.success('Receipt link copied to clipboard', {
      description: 'Direct link to this itemized split',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!expense) return null;

  const currency = expense.currency || activeCurrency;
  const count = roommates.length > 0 ? roommates.length : 1;

  const splits: ExpenseSplit[] =
    expense.splits && expense.splits.length > 0
      ? expense.splits
      : roommates.length > 0
      ? roommates.map((rm) => ({
          userId: rm.id,
          userName: rm.name,
          amount: expense.amount / count,
        }))
      : [
          {
            userId: 'u1',
            userName: expense.payerName || 'Payer',
            amount: expense.amount,
          },
        ];

  return (
    <Sheet open={Boolean(activeReceiptId)} onOpenChange={(open) => !open && closeReceipt()}>
      <SheetContent side="right" className="flex flex-col justify-between p-6 overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <SheetHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold text-sm shrink-0">
                <IconReceipt size={17} />
              </div>
              <div>
                <SheetTitle>{expense.description}</SheetTitle>
                <div className="text-[11px] text-[var(--muted)]">{expense.createdAt} · #{expense.id.slice(0, 8)}</div>
              </div>
            </div>
          </SheetHeader>

          {/* Total & Paid By Banner */}
          <div className="p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] text-center space-y-1">
            <div className="text-xs text-[var(--muted)]">Total Transaction Amount</div>
            <div className="drawer-total mono font-bold text-3xl text-[var(--text)] font-mono tabular-nums">
              {expense.amount.toFixed(2)}
              <span className="currency text-xs ml-1 text-[var(--muted)]">{currency}</span>
            </div>
            <div className="text-xs text-[var(--muted)] pt-1">
              Paid in full by <strong className="text-[var(--text)] font-semibold">{expense.payerName}</strong>
            </div>
          </div>

          {/* Itemized Split Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="drawer-section-label font-bold text-[var(--text)]">Split Breakdown</span>
              <span className="text-[11px] text-[var(--muted)]">{splits.length} participants</span>
            </div>

            <div className="space-y-2">
              {splits.map((split: ExpenseSplit) => (
                <div
                  className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between shadow-2xs"
                  key={split.userId}
                >
                  <span className="text-xs font-medium text-[var(--text)]">{split.userName}</span>
                  <span className="font-mono tabular-nums text-xs font-semibold text-[var(--text)]">
                    {split.amount.toFixed(2)} {currency}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Proof / Attachment */}
          <div className="space-y-2">
            <div className="drawer-section-label font-bold text-xs text-[var(--text)]">Receipt Attachment</div>
            <div className="drawer-receipt-box p-6 rounded-2xl border-2 border-dashed border-[var(--border)] text-center bg-[var(--canvas)]/50">
              <IconReceipt size={28} className="mx-auto mb-1.5 text-[var(--muted)]" />
              <div className="text-xs font-medium text-[var(--text)]">No photo attached</div>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">Physical receipt was not uploaded</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="pt-4 border-t border-[var(--border)] space-y-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="btn-spring w-full h-10 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--canvas)] text-xs font-semibold text-[var(--text)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
          >
            {copied ? <IconCheck size={14} className="text-[var(--positive-text)]" /> : <IconShare size={14} />}
            <span>{copied ? 'Link Copied!' : 'Share Receipt Link'}</span>
          </button>

          {expense.auditInfo && (
            <div className="text-[10px] text-[var(--muted)] text-center">{expense.auditInfo}</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
