import React from 'react';
import { useNavigate } from 'react-router-dom';
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
      return { icon: <IconShoppingCart size={16} />, badgeClass: 'groceries', label: 'Groceries' };
    case 'utilities':
      return { icon: <IconBolt size={16} />, badgeClass: 'utilities', label: 'Utilities' };
    case 'rent':
      return { icon: <IconHome2 size={16} />, badgeClass: 'rent', label: 'Rent' };
    case 'food':
    case 'dining':
      return { icon: <IconCup size={16} />, badgeClass: 'food', label: 'Food & Dining' };
    case 'household':
      return { icon: <IconHome2 size={16} />, badgeClass: 'household', label: 'Household' };
    default:
      return { icon: <IconReceipt2 size={16} />, badgeClass: 'other', label: category || 'Expense' };
  }
};

export const RecentActivityCard: React.FC = () => {
  const navigate = useNavigate();
  const { openReceipt } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);
  const displayExpenses = expenses.slice(0, 3);

  return (
    <section
      className="card-custom flex flex-col shadow-sm"
      aria-labelledby="activity-title"
    >
      <div className="p-3.5 sm:p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="card-title-custom text-sm sm:text-base font-bold text-[var(--text)]" id="activity-title">
            Recent activity
          </h2>
          <span className="text-xs text-[var(--muted)]">{expenses.length} logged</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/expenses')}
          className="text-xs sm:text-sm font-semibold text-[var(--oak)] hover:underline cursor-pointer"
        >
          View all &rarr;
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3.5">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-2.5 w-2/5" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      ) : displayExpenses.length === 0 ? (
        <div className="p-6 flex items-center justify-center">
          <EmptyState
            icon={IconReceiptOff}
            title="No expenses yet"
            description="Be the first to log a shared household expense."
          />
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {displayExpenses.map((expense) => {
            const { icon, badgeClass, label } = getCategoryDetails(expense.category);
            return (
              <button
                type="button"
                key={expense.id}
                onClick={() => openReceipt(expense.id)}
                className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3.5 hover:bg-[var(--sage-tint)]/60 transition-colors text-left cursor-pointer group"
                title="Click to view split details and receipt"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[var(--canvas)] text-[var(--oak)] flex items-center justify-center shrink-0 border border-[var(--border)] group-hover:border-[var(--border-strong)] transition-colors">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[var(--text)] group-hover:text-[var(--oak)] transition-colors truncate">
                        {expense.description}
                      </span>
                      <span className={`cat-badge ${badgeClass} hidden sm:inline-flex text-[11px] px-2 py-0.5`}>
                        {label}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-0.5 truncate">
                      Paid by {expense.payerName} · {expense.createdAt}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="row-amount mono font-bold text-xs sm:text-sm text-[var(--text)]">
                    {expense.amount.toFixed(2)}
                    <span className="currency font-normal text-xs ml-1 text-[var(--muted)]">
                      {expense.currency}
                    </span>
                  </div>
                  {expense.userShare !== undefined && (
                    <div className="text-xs text-[var(--muted)] mt-0.5">
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
