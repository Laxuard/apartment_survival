import React, { useEffect, useState } from 'react';
import { IconX, IconReceipt, IconCheck, IconShare } from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '@/features/expenses/hooks/useExpensesQueries';
import { useRoommatesQuery } from '@/features/roommates';
export const ReceiptDrawer: React.FC = () => {
  const { activeReceiptId, closeReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveCurrency } = useHouseholdStore();
  const activeCurrency = getActiveCurrency();
  const [copied, setCopied] = useState(false);

  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, activeCurrency);

  const expense = expenses.find((e) => e.id === activeReceiptId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeReceipt();
      }
    };
    if (activeReceiptId) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReceiptId, closeReceipt]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/expenses?id=${activeReceiptId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeReceiptId || !expense) return null;

  const currency = expense.currency || activeCurrency;
  const count = roommates.length > 0 ? roommates.length : 1;

  const splits =
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/45 backdrop-blur-xs z-50 animate-fade-in"
        onClick={closeReceipt}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] z-50 shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label="Expense Receipt Details"
      >
        <div className="drawer-head p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold text-sm">
              <IconReceipt size={17} />
            </div>
            <div>
              <h2 className="font-serif text-base font-semibold text-[var(--text)]">Transaction Receipt</h2>
              <div className="text-[11px] text-[var(--muted)]">{expense.createdAt} · #{expense.id.slice(0, 8)}</div>
            </div>
          </div>
          <button
            type="button"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
            onClick={closeReceipt}
            aria-label="Close drawer"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="drawer-body p-5 space-y-5 overflow-y-auto">
          {/* Total & Paid By Banner */}
          <div className="p-4 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] text-center space-y-1">
            <div className="text-xs text-[var(--muted)]">Total Transaction Amount</div>
            <div className="drawer-total mono font-bold text-3xl text-[var(--text)]">
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
              {splits.map((split) => (
                <div
                  className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between shadow-2xs"
                  key={split.userId}
                >
                  <span className="text-xs font-medium text-[var(--text)]">{split.userName}</span>
                  <span className="mono text-xs font-semibold text-[var(--text)]">
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

          {/* Quick Actions */}
          <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-spring flex-1 h-9 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--sage-tint)] text-xs font-medium text-[var(--text)] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              {copied ? <IconCheck size={14} className="text-[var(--positive-text)] animate-icon-pop" /> : <IconShare size={14} />}
              <span>{copied ? 'Link Copied!' : 'Share Receipt'}</span>
            </button>
          </div>

          {expense.auditInfo && (
            <div className="drawer-audit text-[10px] text-[var(--muted)] text-center">{expense.auditInfo}</div>
          )}
        </div>
      </aside>
    </>
  );
};
