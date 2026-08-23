import React from 'react';
import { IconPlus, IconReceipt2, IconReceiptOff } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '../hooks/useExpensesQueries';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

const formatCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    GROCERIES: 'Groceries',
    UTILITIES: 'Utilities',
    RENT: 'Rent',
    HOUSEHOLD: 'Household',
    OTHER: 'Other',
  };
  return map[category?.toUpperCase()] || category;
};

export const ExpensesPage: React.FC = () => {
  const { openModal, openReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--text)]">Expenses & Ledger</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Track household spending, split logs, and historical transactions.
          </p>
        </div>
        <Button
          onClick={() => openModal('expense')}
          className="bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white w-full sm:w-auto cursor-pointer"
        >
          <IconPlus size={16} className="mr-1.5" />
          Log Expense
        </Button>
      </div>

      <div className="card-custom">
        <div className="card-head">
          <h2 className="card-title-custom">All Transactions</h2>
          <div className="card-title-sub">
            {isLoading ? 'Loading...' : `${expenses.length} records`}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 py-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <EmptyState
            icon={IconReceiptOff}
            title="No transactions logged"
            description="Log your first household expense to start building your ledger."
            action={
              <Button
                onClick={() => openModal('expense')}
                className="bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs cursor-pointer"
              >
                <IconPlus size={14} className="mr-1" /> Log Expense
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {expenses.map((expense) => (
              <button
                type="button"
                key={expense.id}
                onClick={() => openReceipt(expense.id)}
                className="row-clickable flex items-center justify-between py-3.5 px-2 w-full text-left cursor-pointer rounded-lg hover:bg-[var(--sage-tint)] transition-colors"
                title="Click to view receipt breakdown"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="row-icon-box shrink-0">
                    <IconReceipt2 size={16} />
                  </div>
                  <div className="truncate">
                    <div className="row-title font-medium">{expense.description}</div>
                    <div className="row-meta text-xs text-[var(--muted)]">
                      Paid by {expense.payerName} · {expense.createdAt} · {formatCategoryLabel(expense.category)}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="row-amount mono font-semibold">
                    {expense.amount.toFixed(2)}
                    <span className="currency">{expense.currency}</span>
                  </div>
                  {expense.userShare !== undefined && (
                    <div className="row-share text-[11px] text-[var(--muted)]">
                      Your share: {expense.userShare.toFixed(2)} {expense.currency}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
