import React from 'react';
import { IconDots, IconBrandWhatsapp } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useRoommatesQuery } from '@/features/roommates/hooks/useRoommatesQueries';

export const RoommateBalancesCard: React.FC = () => {
  const { openModal } = useUIStore();
  const { activeHouseholdId, getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const activeCurrency = getActiveCurrency();

  const { data: roommates = [], isLoading } = useRoommatesQuery(
    activeHouseholdId,
    activeCurrency
  );

  const handleWhatsAppReminder = (name: string, amount: number) => {
    const aptName = activeHousehold?.name || 'Apartment 4B';
    const text = `Hey ${name}, just checking in on our ${aptName} tab. You currently have a balance of ${amount.toFixed(2)} ${activeCurrency}. Whenever you get a chance!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="card-custom card-interactive transition-all duration-200" aria-labelledby="balances-title">
      <div className="card-head">
        <h2 className="card-title-custom" id="balances-title">
          Roommate balances
        </h2>
        <div className="card-title-sub">{roommates.length} flatmates</div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-[var(--muted)]">Loading balances...</div>
        ) : (
          roommates.map((rm) => (
            <div className="rm-row" key={rm.id}>
              <span className={`avatar-badge ${rm.avatarColor}`} aria-hidden="true">
                {rm.avatarInitial}
              </span>
              <div className="rm-name-wrap">
                <div className="rm-name">{rm.name}</div>
                <div className="rm-sub flex items-center gap-1.5">
                  <span>{rm.balance >= 0 ? 'Owes you' : 'You owe'}</span>
                  {rm.overdueDays ? (
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[var(--warn-bg)] text-[var(--warn-text)] pulse-subtle">
                      {rm.overdueDays}d overdue
                    </span>
                  ) : null}
                </div>
              </div>
              <span className={`pill-balance ${rm.balance >= 0 ? 'pos' : 'neg'}`}>
                {rm.balance >= 0 ? '+' : ''}
                {rm.balance.toFixed(2)} {rm.currency}
              </span>

              <div className="rm-actions">
                {rm.balance > 0 && (
                  <button
                    type="button"
                    className="btn-icon-action cursor-pointer"
                    aria-label={`Remind ${rm.name} via WhatsApp`}
                    title="Send reminder via WhatsApp"
                    onClick={() => handleWhatsAppReminder(rm.name, rm.balance)}
                  >
                    <IconBrandWhatsapp size={15} />
                  </button>
                )}

                <button
                  type="button"
                  className="btn-chip cursor-pointer"
                  onClick={() => openModal('settle')}
                >
                  Settle
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="btn-icon-action cursor-pointer p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--sage-tint)] transition-colors"
                    aria-label={`More actions for ${rm.name}`}
                  >
                    <IconDots size={15} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)] shadow-lg rounded-xl">
                    <DropdownMenuItem 
                      onClick={() => openModal('settle')}
                      className="cursor-pointer text-xs hover:bg-[var(--sage-tint)]"
                    >
                      Settle balance
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
