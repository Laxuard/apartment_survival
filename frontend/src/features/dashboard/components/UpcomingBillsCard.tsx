import React from 'react';
import { IconWifi, IconHome, IconBolt, IconDroplet, IconCalendarDue } from '@tabler/icons-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useBillsQuery } from '@/features/bills/hooks/useBillsQueries';
import { useRoommatesQuery } from '@/features/roommates';

const getBillIcon = (iconName: string) => {
  switch (iconName) {
    case 'wifi':
      return <IconWifi size={15} />;
    case 'home':
      return <IconHome size={15} />;
    case 'bolt':
      return <IconBolt size={15} />;
    case 'water':
      return <IconDroplet size={15} />;
    default:
      return <IconHome size={15} />;
  }
};

export const UpcomingBillsCard: React.FC = () => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const activeCurrency = getActiveCurrency();

  const { data: bills = [], isLoading } = useBillsQuery(activeHouseholdId);
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, activeCurrency);
  const memberCount = Math.max(1, roommates.length || activeHousehold?.memberCount || 1);

  return (
    <section className="card-custom card-interactive transition-all duration-200" aria-labelledby="bills-title">
      <div className="card-head">
        <div className="flex items-center gap-2">
          <h2 className="card-title-custom" id="bills-title">
            Upcoming bills
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--muted)]">
            <IconCalendarDue size={13} />
            Auto-split
          </span>
        </div>
        <div className="card-title-sub">{bills.length} due soon</div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-[var(--muted)]">Loading upcoming bills...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-6 text-xs text-[var(--muted)]">No upcoming bills due.</div>
        ) : (
          bills.map((bill) => {
            const share = bill.amount / memberCount;
            const isUrgent =
              bill.dueText.toLowerCase().includes('tomorrow') ||
              bill.dueText.toLowerCase().includes('3 days') ||
              (bill.dueDays && bill.dueDays <= 3);
            const billCurrency = bill.currency || activeCurrency;

            return (
              <div
                className="row-item"
                key={bill.id}
              >
                <div className="row-icon-box shrink-0" aria-hidden="true">
                  {getBillIcon(bill.iconName)}
                </div>
                <div className="row-body flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="row-title font-medium text-[13px] text-[var(--text)] truncate">
                      {bill.title}
                    </span>
                    {isUrgent && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--warn-bg)] text-[var(--warn-text)] pulse-subtle">
                        Due Soon
                      </span>
                    )}
                  </div>
                  <div className="row-meta text-xs text-[var(--muted)] mt-0.5">{bill.dueText}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="row-amount mono font-semibold text-sm text-[var(--text)]">
                    {bill.amount.toFixed(2)}
                    <span className="currency font-normal text-xs ml-0.5 text-[var(--muted)]">
                      {billCurrency}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--muted)] font-medium">
                    Your share: ~{share.toFixed(2)} {billCurrency}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
