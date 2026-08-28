import React from 'react';
import {
  IconShoppingCart,
  IconBolt,
  IconReceiptOff,
  IconReceipt2,
  IconHome2,
  IconCup,
} from '@tabler/icons-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useExpensesQuery } from '@/features/expenses';

const getCategoryDetails = (category: string) => {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'groceries':
      return { icon: <IconShoppingCart size={15} />, badgeClass: 'groceries', label: 'Groceries' };
    case 'utilities':
      return { icon: <IconBolt size={15} />, badgeClass: 'utilities', label: 'Utilities' };
    case 'rent':
      return { icon: <IconHome2 size={15} />, badgeClass: 'rent', label: 'Rent' };
    case 'food':
    case 'dining':
      return { icon: <IconCup size={15} />, badgeClass: 'food', label: 'Food & Dining' };
    case 'household':
      return { icon: <IconHome2 size={15} />, badgeClass: 'household', label: 'Household' };
    default:
      return { icon: <IconReceipt2 size={15} />, badgeClass: 'other', label: category || 'Expense' };
  }
};

export const RecentActivityCard: React.FC = () => {
  const { openReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);

  return (
    <section
      className="card-custom card-interactive transition-all duration-200"
      aria-labelledby="activity-title"
    >
      <div className="card-head">
        <h2 className="card-title-custom" id="activity-title">
          Recent activity
        </h2>
        <div className="card-title-sub">{expenses.length} logged</div>
      </div>

      {isLoading ? (
        <div className="space-y-3 py-4 px-5">
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
      ) : expenses.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={IconReceiptOff}
            title="No expenses yet"
            description="Be the first to log a shared household expense."
          />
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {expenses.map((expense) => {
            const { icon, badgeClass, label } = getCategoryDetails(expense.category);
            return (
              <button
                type="button"
                key={expense.id}
                onClick={() => openReceipt(expense.id)}
                className="row-clickable"
                title="Click to view split details and receipt"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="row-icon-box shrink-0" aria-hidden="true">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="row-title font-medium text-[13px] text-[var(--text)] truncate">
                        {expense.description}
                      </span>
                      <span className={`cat-badge ${badgeClass} hidden sm:inline-flex`}>
                        {label}
                      </span>
                    </div>
                    <div className="row-meta text-xs text-[var(--muted)] mt-0.5">
                      Paid by {expense.payerName} · {expense.createdAt}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="row-amount mono font-semibold text-sm text-[var(--text)]">
                    {expense.amount.toFixed(2)}
                    <span className="currency font-normal text-xs ml-0.5 text-[var(--muted)]">
                      {expense.currency}
                    </span>
                  </div>
                  {expense.userShare !== undefined && (
                    <div className="row-share text-[11px] text-[var(--muted)] font-medium">
                      Your share: {expense.userShare.toFixed(2)} {expense.currency}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
