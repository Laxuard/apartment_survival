import React, { useEffect } from 'react';
import { IconX, IconReceipt } from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '@/features/expenses/hooks/useExpensesQueries';
import { MOCK_EXPENSES } from '../mocks/expensesData';

export const ReceiptDrawer: React.FC = () => {
  const { activeReceiptId, closeReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);

  // Find expense in query results or fallback to mock fixtures
  const expense =
    expenses.find((e) => e.id === activeReceiptId) ||
    MOCK_EXPENSES.find((e) => e.id === activeReceiptId);

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

  if (!activeReceiptId || !expense) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-overlay"
        onClick={closeReceipt}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawerTitle"
      >
        <div className="drawer-head">
          <h2 id="drawerTitle">{expense.description}</h2>
          <button
            type="button"
            className="drawer-close cursor-pointer"
            aria-label="Close receipt"
            onClick={closeReceipt}
          >
            <IconX size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-total mono">
            {expense.amount.toFixed(2)}
            <span className="currency">{expense.currency}</span>
          </div>
          <div className="drawer-meta">
            Paid {expense.amount.toFixed(2)} {expense.currency} by {expense.payerName}
          </div>

          <div className="drawer-section-label">Split breakdown</div>
          <div className="space-y-1 mb-4">
            {expense.splits.length > 0 ? (
              expense.splits.map((split) => (
                <div className="drawer-split-row" key={split.userId}>
                  <span>{split.userName}</span>
                  <span className="mono">
                    {split.amount.toFixed(2)} {expense.currency}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[var(--muted)] py-1">
                Equal split among household members
              </div>
            )}
          </div>

          <div className="drawer-section-label">Receipt Photo</div>
          <div className="drawer-receipt-box">
            <IconReceipt size={24} className="mx-auto mb-1.5 text-[var(--muted)]" />
            <span>No receipt photo attached</span>
          </div>

          {expense.auditInfo && (
            <div className="drawer-audit">{expense.auditInfo}</div>
          )}
        </div>
      </aside>
    </>
  );
};
