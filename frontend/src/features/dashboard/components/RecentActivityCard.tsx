import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpensesQuery } from '@/features/expenses';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  IconBolt,
  IconCup,
  IconHome2,
  IconPlus,
  IconReceipt2,
  IconReceiptOff,
  IconShoppingCart,
} from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const getCategoryDetails = (category: string) => {
  const cat = (category || '').toLowerCase();
  switch (cat) {
    case 'groceries':
      return { icon: <IconShoppingCart size={18} />, badgeClass: 'groceries', label: 'Groceries' };
    case 'utilities':
      return { icon: <IconBolt size={18} />, badgeClass: 'utilities', label: 'Utilities' };
    case 'rent':
      return { icon: <IconHome2 size={18} />, badgeClass: 'rent', label: 'Rent' };
    case 'food':
    case 'dining':
      return { icon: <IconCup size={18} />, badgeClass: 'food', label: 'Food & Dining' };
    case 'household':
      return { icon: <IconHome2 size={18} />, badgeClass: 'household', label: 'Household' };
    default:
      return { icon: <IconReceipt2 size={18} />, badgeClass: 'other', label: category || 'Expense' };
  }
};

export const RecentActivityCard: React.FC = () => {
  const navigate = useNavigate();
  const { openReceipt, openModal } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);
  const displayExpenses = expenses.slice(0, 5);

  return (
    <section
      className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex flex-col h-full min-h-[460px] shadow-sm select-none"
      aria-labelledby="activity-title"
    >
      {/* 1. Header with Whisper Divider (Always persistently rendered) */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)]/40 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text)]" id="activity-title">
            Recent Activity
          </h3>
          <span className="text-xs text-[var(--muted)] font-medium">
            {isLoading ? '...' : `${expenses.length} logged`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/expenses')}
          className="text-xs text-[var(--oak)] hover:text-[var(--oak-hover)] font-medium cursor-pointer"
        >
          View all &rarr;
        </button>
      </div>

      {/* 2. Deep Vertical Ledger with Flex-Grow Empty Space Absorption */}
      <div className="flex-1 flex flex-col justify-between">
        {isLoading ? (
          // Exact 7-row skeleton matching full stretched column height
          <div className="flex-1 flex flex-col justify-between divide-y divide-[var(--border)]">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 px-1">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <Skeleton className="w-10 h-10 rounded-lg skeleton-warm shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3.5 w-36 skeleton-warm" />
                    <Skeleton className="h-2.5 w-24 skeleton-warm" />
                  </div>
                </div>
                <div className="space-y-2 text-right shrink-0 ml-3">
                  <Skeleton className="h-4 w-16 skeleton-warm ml-auto" />
                  <Skeleton className="h-3 w-12 skeleton-warm ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : displayExpenses.length === 0 ? (
          // Perfectly Centered N=0 Empty State
          <div className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center space-y-3 my-auto py-8">
            <div className="w-12 h-12 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
              <IconReceiptOff size={22} />
            </div>
            <div className="space-y-1 max-w-xs">
              <div className="font-bold text-sm text-[var(--text)]">No expenses logged yet</div>
              <p className="text-xs text-[var(--muted)]">
                Log your first grocery run or apartment utility bill to start splitting.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openModal('expense')}
              className="mt-4 btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold px-4 py-2 h-8 rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1.5"
            >
              <IconPlus size={14} />
              <span>Log First Expense</span>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            {/* Populated Row Feed */}
            <div className="flex flex-col">
              {displayExpenses.map((expense, index) => {
                const { icon, badgeClass, label } = getCategoryDetails(expense.category);
                return (
                  <button
                    type="button"
                    key={expense.id}
                    onClick={() => openReceipt(expense.id)}
                    style={{ animationDelay: `${index * 45}ms` }}
                    className="animate-fade-up flex items-center justify-between py-3.5 border-b border-[var(--border)] last:border-0 hover:bg-[var(--canvas)]/80 dark:hover:bg-white/[0.03] rounded-lg -mx-2 px-2 cursor-pointer group transition-all duration-200 text-left"
                    title="Click to view itemized split receipt"
                  >
                    {/* Left Side (Details): Icon Box + Text Stack */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-lg bg-[var(--canvas)] border border-[var(--border)] text-[var(--oak)] flex items-center justify-center shrink-0 group-hover:border-[var(--oak)]/50 group-hover:bg-[var(--oak-tint)]/20 dark:group-hover:bg-white/5 transition-all">
                        {icon}
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center truncate">
                          <span className="font-medium text-sm text-[var(--text)] group-hover:text-[var(--oak)] transition-colors truncate">
                            {expense.description}
                          </span>
                          <span className={`cat-badge ${badgeClass} text-[10px] ml-2 px-1.5 py-0.5 rounded hidden sm:inline-flex shrink-0`}>
                            {label}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--muted)] mt-0.5 truncate">
                          Paid by {expense.payerName} · {expense.createdAt}
                        </div>
                      </div>
                    </div>

                    {/* Right Side (Amounts): Total Amount + User Share */}
                    <div className="flex flex-col items-end text-right shrink-0 ml-3">
                      <div className="font-mono text-sm font-semibold text-[var(--text)]">
                        {expense.amount.toFixed(2)}{' '}
                        <span className="font-normal text-xs text-[var(--muted)]">{expense.currency}</span>
                      </div>
                      {expense.userShare !== undefined && (
                        <div className="font-mono text-xs text-[var(--muted)] mt-0.5">
                          Your share: {expense.userShare.toFixed(2)} {expense.currency}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* The "Flex-Grow Ghost CTA" (Dynamically Absorbs 100% Remaining Vertical Space) */}
            {displayExpenses.length < 8 && (
              <button
                type="button"
                onClick={() => openModal('expense')}
                style={{ animationDelay: `${displayExpenses.length * 45}ms` }}
                className="animate-fade-up flex-1 w-full min-h-[95px] mt-3 rounded-xl border border-dashed border-[var(--border)] dark:border-white/10 flex flex-col items-center justify-center gap-2 text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--oak)]/50 hover:bg-[var(--oak-tint)]/20 dark:hover:bg-[var(--oak)]/5 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--canvas)] dark:bg-white/5 group-hover:bg-[var(--oak-tint)] dark:group-hover:bg-[var(--oak)]/20 flex items-center justify-center transition-colors shadow-2xs">
                  <IconPlus size={16} className="text-[var(--muted)] group-hover:text-[var(--oak)] transition-colors" />
                </div>
                <span className="text-xs sm:text-sm font-medium">Log another expense</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
