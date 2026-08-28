import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { IconWifi, IconHome, IconBolt, IconDroplet, IconCalendarDue } from '@tabler/icons-react';
import { useBillsSummary } from '@/features/bills';
import { useHouseholdLedger } from '@/features/roommates';
import { useUIStore } from '@/stores/useUIStore';
import { Skeleton } from '@/components/ui/skeleton';

const getBillIcon = (iconName: string) => {
  switch (iconName) {
    case 'wifi':
      return <IconWifi size={17} />;
    case 'home':
      return <IconHome size={17} />;
    case 'bolt':
      return <IconBolt size={17} />;
    case 'water':
      return <IconDroplet size={17} />;
    default:
      return <IconHome size={17} />;
  }
};

export const UpcomingBillsCard: React.FC = () => {
  const navigate = useNavigate();
  const { bills, isLoading, currency } = useBillsSummary();
  const ledger = useHouseholdLedger();
  const { openExpenseModal } = useUIStore();
  const memberCount = Math.max(1, ledger.memberCount || 1);

  const handlePayBill = (bill: { title: string; amount: number; iconName: string }) => {
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
    <section className="card-custom flex flex-col shadow-sm" aria-labelledby="bills-title">
      <div className="p-3.5 sm:p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="card-title-custom text-sm sm:text-base font-bold text-[var(--text)]" id="bills-title">
            Upcoming bills
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)]">
            <IconCalendarDue size={14} />
            Auto-split
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="text-xs sm:text-sm font-semibold text-[var(--oak)] hover:underline cursor-pointer"
        >
          Manage &rarr;
        </button>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="space-y-1.5">
                    <Skeleton className="w-24 h-3.5" />
                    <Skeleton className="w-16 h-2.5" />
                  </div>
                </div>
                <div className="space-y-1.5 text-right">
                  <Skeleton className="w-16 h-4 ml-auto" />
                  <Skeleton className="w-20 h-2.5 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-6 text-xs sm:text-sm text-[var(--muted)]">No upcoming bills due.</div>
        ) : (
          bills.slice(0, 2).map((bill) => {
            const share = bill.amount / memberCount;
            const isUrgent =
              bill.dueText.toLowerCase().includes('tomorrow') ||
              bill.dueText.toLowerCase().includes('3 days') ||
              (bill.dueDays && bill.dueDays <= 3);
            const billCurrency = bill.currency || currency;

            return (
              <div
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3.5 hover:bg-[var(--sage-tint)]/60 transition-colors"
                key={bill.id}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 rounded-xl bg-[var(--canvas)] text-[var(--oak)] flex items-center justify-center shrink-0 border border-[var(--border)]">
                    {getBillIcon(bill.iconName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-[var(--text)] truncate">
                        {bill.title}
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--warn-bg)] text-[var(--warn-text)] shrink-0">
                          Due Soon
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--muted)] mt-0.5">{bill.dueText}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="row-amount mono font-bold text-xs sm:text-sm text-[var(--text)]">
                      {bill.amount.toFixed(2)}
                      <span className="currency font-normal text-xs ml-1 text-[var(--muted)]">
                        {billCurrency}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted)] font-medium">
                      ~{share.toFixed(2)} / person
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePayBill(bill)}
                    className="btn-spring px-3.5 py-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--oak)] hover:border-[var(--oak)] hover:text-white text-xs sm:text-sm font-semibold text-[var(--text)] cursor-pointer shadow-2xs transition-all"
                    title={`Record payment & auto-split for ${bill.title}`}
                  >
                    Pay
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
