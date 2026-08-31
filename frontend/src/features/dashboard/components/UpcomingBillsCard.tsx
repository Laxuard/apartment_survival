import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBillsSummary, type Bill } from '@/features/bills';
import { useUIStore } from '@/stores/useUIStore';
import { IconBolt, IconCalendarDue, IconPlus } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const UpcomingBillsCard: React.FC = () => {
  const navigate = useNavigate();
  const { bills = [], isLoading, currency } = useBillsSummary();
  const { openModal, openExpenseModal } = useUIStore();

  const handlePayBill = (bill: Bill) => {
    const category = bill.iconName === 'home' ? 'RENT' : 'UTILITIES';
    openExpenseModal({
      title: bill.title,
      amount: bill.amount,
      category,
    });
    toast.info(`Pre-filled Log Expense for ${bill.title}`, {
      description: `Amount: ${bill.amount.toFixed(2)} ${currency} · Auto-split ready.`,
    });
  };

  return (
    <section
      className="min-h-[190px] bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex flex-col shadow-sm select-none"
      aria-labelledby="bills-title"
    >
      {/* 1. Header with Whisper Divider (Persistently rendered) */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)]/40 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text)]" id="bills-title">
            Upcoming Bills
          </h3>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] font-medium">
            <IconCalendarDue size={13} />
            Auto-split
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="text-xs text-[var(--oak)] hover:text-[var(--oak-hover)] font-medium cursor-pointer"
        >
          Manage &rarr;
        </button>
      </div>

      {/* 2. Time-Oriented List Body with Height-Matched Skeletons */}
      <div className="flex-1 flex flex-col justify-center">
        {isLoading ? (
          // 3-row skeleton matching exact empty/populated height (~190px)
          <div className="flex-1 flex flex-col justify-center space-y-3 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-1">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-lg skeleton-warm shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-28 h-3.5 skeleton-warm" />
                    <Skeleton className="w-16 h-2.5 skeleton-warm" />
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <Skeleton className="w-16 h-4 skeleton-warm ml-auto" />
                  <Skeleton className="w-12 h-3 skeleton-warm ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : bills.length === 0 ? (
          // Perfectly Centered N=0 Empty State
          <div className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center space-y-2 my-auto py-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
              <IconBolt size={22} />
            </div>
            <div className="space-y-0.5 max-w-xs">
              <div className="font-bold text-xs text-[var(--text)]">No recurring bills</div>
              <p className="text-[11px] text-[var(--muted)]">
                Add monthly rent or Wi-Fi to automate split schedules.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openModal('expense')}
              className="mt-4 btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-[11px] font-semibold px-3 py-1.5 h-7 rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1"
            >
              <IconPlus size={13} />
              <span>Set Up First Bill</span>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              {bills.slice(0, 2).map((bill, index) => {
                const parts = (bill.dueText || '').split(' ');
                const month = parts[0]?.toUpperCase() || 'DUE';
                const day = parts[1] || '01';

                return (
                  <div
                    key={bill.id}
                    onClick={() => handlePayBill(bill)}
                    style={{ animationDelay: `${index * 45}ms` }}
                    className="animate-fade-up flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--canvas)]/80 dark:hover:bg-white/[0.03] cursor-pointer group transition-all duration-200"
                    title={`Click to record payment & split for ${bill.title}`}
                  >
                    {/* Left: Calendar Date Square (48x48) + Bill Name */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-[var(--canvas)] border border-[var(--border)] group-hover:border-[var(--oak)]/50 group-hover:bg-[var(--oak-tint)]/20 transition-all shrink-0">
                        <span className="text-[10px] uppercase text-[var(--muted)] group-hover:text-[var(--oak)] font-semibold leading-none transition-colors">
                          {month}
                        </span>
                        <span className="text-sm font-bold text-[var(--text)] leading-none mt-1 font-mono">
                          {day}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--oak)] transition-colors truncate">
                        {bill.title}
                      </span>
                    </div>

                    {/* Right: Exact Typographic Stack matching Recent Activity */}
                    <div className="flex flex-col items-end text-right shrink-0 ml-2">
                      <div className="font-mono text-sm font-semibold text-[var(--text)]">
                        {bill.amount.toFixed(2)}{' '}
                        <span className="font-normal text-xs text-[var(--muted)]">{bill.currency || currency}</span>
                      </div>
                      <div className="font-mono text-xs text-[var(--muted)] mt-0.5">
                        Auto-split
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Flex-Grow Ghost CTA when fewer than 2 bills */}
            {bills.length < 2 && (
              <button
                type="button"
                onClick={() => openModal('expense')}
                style={{ animationDelay: `${bills.length * 45}ms` }}
                className="animate-fade-up flex-1 w-full min-h-[44px] mt-2.5 rounded-xl border border-dashed border-[var(--border)] dark:border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--oak)]/50 hover:bg-[var(--oak-tint)]/20 dark:hover:bg-[var(--oak)]/5 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--canvas)] dark:bg-white/5 group-hover:bg-[var(--oak-tint)] dark:group-hover:bg-[var(--oak)]/20 flex items-center justify-center transition-colors shadow-2xs">
                  <IconPlus size={13} className="text-[var(--muted)] group-hover:text-[var(--oak)] transition-colors" />
                </div>
                <span>Add monthly recurring bill</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
