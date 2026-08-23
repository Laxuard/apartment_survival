import React from 'react';
import { IconUserPlus, IconDots, IconBrandWhatsapp } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useBalancesQuery } from '@/features/expenses/hooks/useExpensesQueries';
import { MOCK_ROOMMATES } from '../mocks/roommatesData';

export const RoommatesPage: React.FC = () => {
  const { openModal } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const { data: balanceData } = useBalancesQuery(activeHouseholdId);

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
      }))
    : MOCK_ROOMMATES;

  const handleWhatsAppReminder = (name: string, amount: number) => {
    const text = `Hey ${name}, just checking in on our Apartment tab. You currently have a balance of ${amount.toFixed(2)} MAD. Whenever you get a chance!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--text)]">Roommates & Invites</h1>
          <p className="text-xs text-[var(--muted)] mt-1">
            Manage apartment membership, permissions, and payment reminders.
          </p>
        </div>
        <Button
          onClick={() => openModal('invite')}
          className="bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white w-full sm:w-auto cursor-pointer"
        >
          <IconUserPlus size={16} className="mr-1.5" />
          Invite Roommate
        </Button>
      </div>

      <div className="card-custom">
        <div className="card-head">
          <h2 className="card-title-custom">Household Members</h2>
          <div className="card-title-sub">{roommates.length} active</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {roommates.map((rm) => (
            <div key={rm.id} className="rm-row py-3">
              <span className={`avatar-badge ${rm.avatarColor}`} aria-hidden="true">
                {rm.avatarInitial}
              </span>
              <div className="rm-name-wrap">
                <div className="rm-name flex items-center gap-2">
                  <span>{rm.name}</span>
                  {rm.role === 'ADMIN' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--oak-tint)] text-[var(--oak-hover)] dark:text-[var(--oak)] font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <div className="rm-sub">{rm.email}</div>
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
                  className="bell-btn cursor-pointer"
                  aria-label={`Actions for ${rm.name}`}
                >
                  <IconDots size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
