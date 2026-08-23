import React, { useState } from 'react';
import {
  IconShoppingCart,
  IconBolt,
  IconReceiptOff,
  IconReceipt2,
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '@/features/expenses/hooks/useExpensesQueries';

type DemoState = 'live' | 'skeleton' | 'empty';

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'groceries':
      return <IconShoppingCart size={16} />;
    case 'utilities':
      return <IconBolt size={16} />;
    default:
      return <IconReceipt2 size={16} />;
  }
};

export const RecentActivityCard: React.FC = () => {
  const [demoState, setDemoState] = useState<DemoState>('live');
  const { openReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);

  const toggleDemoState = () => {
    if (demoState === 'live') {
      setDemoState('skeleton');
      setTimeout(() => setDemoState('empty'), 700);
    } else if (demoState === 'empty') {
      setDemoState('live');
    } else {
      setDemoState('live');
    }
  };

  const isShowingSkeleton = demoState === 'skeleton' || (demoState === 'live' && isLoading);
  const isShowingEmpty = demoState === 'empty' || (demoState === 'live' && !isLoading && expenses.length === 0);

  return (
    <section className="card-custom" aria-labelledby="activity-title">
      <div className="card-head">
        <h2 className="card-title-custom" id="activity-title">
          Recent activity
        </h2>
        <button
          type="button"
          onClick={toggleDemoState}
          className="text-[11px] text-[var(--muted)] border border-[var(--border-strong)] rounded px-2 py-0.5 hover:bg-[var(--sage-tint)] cursor-pointer"
        >
          Toggle demo state
        </button>
      </div>

      {demoState === 'live' && !isLoading && expenses.length > 0 && (
        <div className="divide-y divide-[var(--border)]">
          {expenses.map((expense) => (
            <button
              type="button"
              key={expense.id}
              onClick={() => openReceipt(expense.id)}
              className="row-clickable flex items-start gap-2.5 w-full text-left cursor-pointer"
              title="Click to view split details and receipt"
            >
              <div className="row-icon-box shrink-0" aria-hidden="true">
                {getCategoryIcon(expense.category)}
              </div>
              <div className="row-body">
                <div className="row-title">{expense.description}</div>
                <div className="row-meta">
                  Paid by {expense.payerName} · {expense.createdAt}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="row-amount mono">
                  {expense.amount.toFixed(2)}
                  <span className="currency">{expense.currency}</span>
                </div>
                {expense.userShare !== undefined && (
                  <div className="row-share">
                    Your share: {expense.userShare.toFixed(2)} {expense.currency}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {isShowingSkeleton && (
        <div className="space-y-3 py-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-2.5 w-2/5" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      )}

      {isShowingEmpty && !isShowingSkeleton && (
        <EmptyState
          icon={IconReceiptOff}
          title="No expenses yet"
          description="Be the first to log a shared household expense."
        />
      )}
    </section>
  );
};
