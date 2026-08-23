import React from 'react';
import { IconDots, IconBrandWhatsapp } from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MOCK_ROOMMATES } from '@/features/roommates/mocks/roommatesData';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useBalancesQuery } from '@/features/expenses/hooks/useExpensesQueries';

export const RoommateBalancesCard: React.FC = () => {
  const { openModal } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: balanceData } = useBalancesQuery(activeHouseholdId);

  // Map server members if available, otherwise fallback to fixture
  const roommates = balanceData?.members
    ? balanceData.members.map((m, idx) => ({
        id: m.userId,
        name: m.username,
        email: `${m.username.toLowerCase()}@apartment.com`,
        avatarInitial: m.username.charAt(0).toUpperCase(),
        avatarColor: idx % 2 === 0 ? ('oak' as const) : ('sage' as const),
        balance: Number(m.netBalance),
        currency: balanceData.currency || 'MAD',
        role: 'MEMBER' as const,
        overdueDays: undefined,
      }))
    : MOCK_ROOMMATES;

  const handleWhatsAppReminder = (name: string, amount: number) => {
    const text = `Hey ${name}, just checking in on our Apartment 4B tab. You currently have a balance of ${amount.toFixed(2)} MAD. Whenever you get a chance!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="card-custom" aria-labelledby="balances-title">
      <div className="card-head">
        <h2 className="card-title-custom" id="balances-title">
          Roommate balances
        </h2>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {roommates.map((rm) => (
          <div className="rm-row" key={rm.id}>
            <span className={`avatar-badge ${rm.avatarColor}`} aria-hidden="true">
              {rm.avatarInitial}
            </span>
            <div className="rm-name-wrap">
              <div className="rm-name">{rm.name}</div>
              <div className="rm-sub">
                {rm.balance >= 0 ? 'Owes you' : 'You owe'}
                {rm.overdueDays ? ` · ${rm.overdueDays}d overdue` : ''}
              </div>
            </div>
            <span className={`pill-balance ${rm.balance >= 0 ? 'pos' : 'neg'}`}>
              {rm.balance >= 0 ? '+' : ''}{rm.balance.toFixed(2)} {rm.currency}
            </span>

            <div className="rm-actions">
              {rm.balance > 0 && (
                <button
                  type="button"
                  className="btn-icon-action"
                  aria-label={`Remind ${rm.name} via WhatsApp`}
                  title="Send reminder via WhatsApp"
                  onClick={() => handleWhatsAppReminder(rm.name, rm.balance)}
                >
                  <IconBrandWhatsapp size={15} />
                </button>
              )}

              <button
                type="button"
                className="btn-chip"
                onClick={() => openModal('settle')}
              >
                Settle
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  className="bell-btn cursor-pointer p-1"
                  aria-label={`More actions for ${rm.name}`}
                >
                  <IconDots size={16} />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)]">
                  <DropdownMenuItem className="cursor-pointer text-[13px] hover:bg-[var(--sage-tint)]">
                    View history
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer text-[13px] hover:bg-[var(--sage-tint)]">
                    Edit balance
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
