import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { DataCard } from '@/components/ui/DataCard';
import { Skeleton } from '@/components/ui/skeleton';
import { formatMoney } from '@/domain';
import {
  useBillsSummary,
  getBillDueInfo,
  getCurrentPeriod,
} from '@/features/bills';
import { useRoommatesQuery } from '@/features/roommates';
import { useActiveHousehold } from '@/features/households';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import {
  IconBolt,
  IconHome2,
  IconReceipt2,
  IconTools,
  IconWorld,
  IconCalendarDue,
  IconPlus,
  IconCheck,
  IconSparkles,
} from '@tabler/icons-react';

const getCategoryIcon = (category: string, iconName?: string) => {
  if (category === 'RENT' || iconName === 'home') return IconHome2;
  if (category === 'MAINTENANCE' || iconName === 'tools') return IconTools;
  if (iconName === 'wifi' || category === 'UTILITIES') return IconWorld;
  if (iconName === 'bolt') return IconBolt;
  return IconReceipt2;
};

export const UpcomingBillsCard: React.FC = () => {
  const { bills = [], isLoading, currency } = useBillsSummary();
  const { openBillModal, openManageBillsModal, openMarkBillPaidModal } = useUIStore();
  const { activeHouseholdId } = useActiveHousehold();
  const { user } = useAuthStore();
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);

  const currentPeriod = getCurrentPeriod();

  // Create a map for quick roommate name lookup
  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();
    if (user?.id) {
      map.set(user.id, 'You');
    }
    roommates.forEach((r) => {
      map.set(r.id, r.isCurrentUser ? 'You' : r.name);
    });
    return map;
  }, [roommates, user]);

  // Filter bills due in current cycle that are not yet marked paid
  const pendingBills = useMemo(() => {
    return bills.filter((b) => b.lastPaidPeriod !== currentPeriod);
  }, [bills, currentPeriod]);

  return (
    <DataCard
      title={
        <div className="flex items-center gap-2">
          <span>Upcoming Bills</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)] font-medium">
            <IconCalendarDue size={13} />
            Auto-split
          </span>
        </div>
      }
      headerAction={
        <button
          type="button"
          onClick={openManageBillsModal}
          className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Manage</span>
          <span>&rarr;</span>
        </button>
      }
      isLoading={isLoading}
      isEmpty={bills.length === 0}
      className="min-h-[190px] shadow-sm select-none"
      skeleton={
        <div className="flex-1 flex flex-col justify-center space-y-3 py-1">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between p-1">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl skeleton-warm shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="w-28 h-3.5 skeleton-warm" />
                  <Skeleton className="w-20 h-2.5 skeleton-warm" />
                </div>
              </div>
              <div className="space-y-1.5 text-right">
                <Skeleton className="w-16 h-4 skeleton-warm ml-auto" />
                <Skeleton className="w-16 h-6 skeleton-warm ml-auto rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      }
      emptyState={
        <div className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center space-y-2 my-auto py-2">
          <div className="w-11 h-11 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
            <IconBolt size={20} />
          </div>
          <div className="space-y-0.5 max-w-xs">
            <div className="font-bold text-xs text-[var(--text)]">No recurring bills</div>
            <p className="text-[11px] text-[var(--muted)]">
              Add monthly rent or Wi-Fi to automate split schedules.
            </p>
          </div>
          <Button
            size="sm"
            onClick={openBillModal}
            className="mt-3 text-xs rounded-xl"
          >
            <IconPlus size={13} />
            <span>Set Up First Bill</span>
          </Button>
        </div>
      }
    >
      <div className="flex-1 flex flex-col justify-between">
        {pendingBills.length === 0 && bills.length > 0 ? (
          /* All bills paid calm state */
          <div className="py-4 px-2 text-center space-y-2 my-auto animate-fade-up">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-500/20">
              <IconSparkles size={16} />
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-semibold text-[var(--text)]">
                All bills paid for this cycle
              </div>
              <p className="text-[11px] text-[var(--muted)]">
                {bills.length} active recurring {bills.length === 1 ? 'bill is' : 'bills are'} up to date.
              </p>
            </div>
            <button
              type="button"
              onClick={openManageBillsModal}
              className="text-[11px] text-[var(--oak)] hover:underline font-medium cursor-pointer pt-1 inline-block"
            >
              View all bill schedules &rarr;
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingBills.slice(0, 3).map((bill, index) => {
              const Icon = getCategoryIcon(bill.category, bill.iconName);
              const dueInfo = getBillDueInfo(bill);
              const payerName = memberNameMap.get(bill.responsiblePayerId) || bill.responsiblePayerName || 'You';

              return (
                <div
                  key={bill.id}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="animate-fade-up flex items-center justify-between gap-3 p-2 -mx-2 rounded-xl hover:bg-[var(--canvas)]/80 transition-all duration-200 group"
                >
                  {/* Left: Icon + Title & Payer Subtitle */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-[var(--canvas)] border border-[var(--border)] group-hover:border-[var(--oak)]/40 group-hover:bg-[var(--oak-tint)]/20 transition-all flex items-center justify-center shrink-0 shadow-2xs">
                      <Icon size={18} className="text-[var(--oak)] transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--text)] truncate">
                          {bill.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-[var(--muted)] truncate">
                        Paid by {payerName} • Equal split
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount, Due Tag, and Mark Paid Action */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex flex-col items-end text-right">
                      <div className="font-mono text-xs font-bold text-[var(--text)]">
                        {formatMoney(bill.amount, bill.currency || currency)}
                      </div>
                      <span
                        className={`text-[10px] font-medium leading-tight ${
                          dueInfo.isUrgent
                            ? 'text-[var(--oak)] font-semibold'
                            : 'text-[var(--muted)]'
                        }`}
                      >
                        {dueInfo.dueText}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => openMarkBillPaidModal(bill)}
                      className="h-7 px-2.5 text-[11px] font-semibold rounded-lg bg-[var(--canvas)] hover:bg-[var(--oak)] text-[var(--text)] hover:text-white border border-[var(--border)] hover:border-[var(--oak)] transition-all cursor-pointer shadow-2xs"
                    >
                      <IconCheck size={12} className="mr-1" />
                      <span>Mark Paid</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Ghost CTA when fewer bills */}
        {bills.length < 3 && (
          <button
            type="button"
            onClick={openBillModal}
            className="animate-fade-up flex-1 w-full min-h-[40px] mt-2 rounded-xl border border-dashed border-[var(--border)] hover:border-[var(--oak)]/50 hover:bg-[var(--oak-tint)]/15 transition-all flex items-center justify-center gap-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] group cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-[var(--canvas)] group-hover:bg-[var(--oak-tint)] flex items-center justify-center transition-colors shadow-2xs">
              <IconPlus size={12} className="text-[var(--muted)] group-hover:text-[var(--oak)]" />
            </div>
            <span>Add monthly recurring bill</span>
          </button>
        )}
      </div>
    </DataCard>
  );
};
