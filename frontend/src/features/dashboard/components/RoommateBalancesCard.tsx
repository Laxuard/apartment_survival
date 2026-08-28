import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconBrandWhatsapp } from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useHouseholdLedger } from '@/features/roommates';
import { Skeleton } from '@/components/ui/skeleton';

export const RoommateBalancesCard: React.FC = () => {
  const navigate = useNavigate();
  const { openSettleModal } = useUIStore();
  const activeHousehold = useHouseholdStore((s) => s.getActiveHousehold());
  const ledger = useHouseholdLedger();

  const handleWhatsAppReminder = (name: string, amount: number) => {
    const aptName = activeHousehold?.name || 'Apartment 4B';
    const text = `Hey ${name}, just checking in on our ${aptName} tab. You currently have an open balance of ${amount.toFixed(2)} ${ledger.currency}. Whenever you get a chance!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="card-custom flex flex-col shadow-sm" aria-labelledby="balances-title">
      <div className="p-3.5 sm:p-4 border-b border-[var(--border)] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="card-title-custom text-sm sm:text-base font-bold text-[var(--text)]" id="balances-title">
            Roommate balances
          </h2>
          <span className="text-xs text-[var(--muted)]">{ledger.peers.length} flatmates</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/roommates')}
          className="text-xs sm:text-sm font-semibold text-[var(--oak)] hover:underline cursor-pointer"
        >
          View all &rarr;
        </button>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {ledger.isLoading ? (
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
                <div className="flex items-center gap-2">
                  <Skeleton className="w-16 h-6 rounded-full" />
                  <Skeleton className="w-12 h-7 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : ledger.peers.length === 0 ? (
          <div className="text-center py-6 text-xs sm:text-sm text-[var(--muted)] flex items-center justify-center">
            No other flatmates in this space yet.
          </div>
        ) : (
          ledger.peers.map((rm) => (
            <div
              key={rm.id}
              className="p-3.5 sm:p-4 flex items-center justify-between gap-3.5 hover:bg-[var(--sage-tint)]/60 transition-colors"
            >
              {/* Avatar & Name Info */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span
                  className={`w-9 h-9 rounded-xl font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs ${
                    rm.avatarColor === 'oak'
                      ? 'bg-[var(--oak)] text-white'
                      : 'bg-[var(--sage-tint)] text-[var(--sage)]'
                  }`}
                  aria-hidden="true"
                >
                  {rm.avatarInitial}
                </span>

                <div className="truncate flex-1 min-w-0">
                  <div className="text-xs sm:text-sm font-semibold text-[var(--text)] truncate">
                    {rm.name}
                  </div>
                  <div className="text-xs text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                    <span>{rm.balance >= 0 ? 'Owes you' : 'You owe'}</span>
                    {rm.overdueDays ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--warn-bg)] text-[var(--warn-text)] shrink-0">
                        {rm.overdueDays}d overdue
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Balance Pill & Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <span className={`pill-balance ${rm.balance >= 0 ? 'pos' : 'neg'} text-xs sm:text-sm py-1 px-2.5`}>
                  {rm.balance >= 0 ? '+' : ''}
                  {rm.balance.toFixed(2)} {rm.currency}
                </span>

                {rm.balance > 0 && (
                  <button
                    type="button"
                    className="btn-spring w-8 h-8 rounded-xl border border-[var(--border)] hover:border-[#25D366] hover:bg-[#25D366]/10 text-[#25D366] flex items-center justify-center cursor-pointer text-xs transition-all shadow-2xs"
                    aria-label={`Remind ${rm.name} via WhatsApp`}
                    title="Send reminder via WhatsApp"
                    onClick={() => handleWhatsAppReminder(rm.name, rm.balance)}
                  >
                    <IconBrandWhatsapp size={15} />
                  </button>
                )}

                <button
                  type="button"
                  className="btn-spring px-3 py-1.5 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] hover:bg-[var(--oak)] hover:border-[var(--oak)] hover:text-white text-xs sm:text-sm font-semibold text-[var(--text)] cursor-pointer shadow-2xs transition-all"
                  onClick={() => openSettleModal(rm)}
                  title={
                    rm.balance > 0
                      ? `Record payment received from ${rm.name}`
                      : `Record payment sent to ${rm.name}`
                  }
                >
                  Settle
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
