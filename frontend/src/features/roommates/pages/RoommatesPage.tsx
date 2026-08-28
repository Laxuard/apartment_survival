import React, { useState } from 'react';
import {
  IconUserPlus,
  IconBrandWhatsapp,
  IconCopy,
  IconCheck,
  IconArrowsExchange,
  IconShield,
  IconUser,
  IconSparkles,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useRoommatesQuery, useSettlementMatrixQuery } from '../hooks/useRoommatesQueries';

export const RoommatesPage: React.FC = () => {
  const { openModal } = useUIStore();
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const currency = getActiveCurrency();
  const [copied, setCopied] = useState(false);

  const { data: roommates = [], isLoading: isLoadingRoommates } = useRoommatesQuery(
    activeHouseholdId,
    currency
  );
  const { data: settlementPaths = [], isLoading: isLoadingMatrix } = useSettlementMatrixQuery(
    activeHouseholdId,
    currency
  );

  const handleCopyInvite = () => {
    const inviteUrl = `${window.location.origin}/invite/${activeHouseholdId || 'apt-invite'}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppReminder = (name: string, amount: number) => {
    const aptName = activeHousehold?.name || 'Apartment 4B';
    const text = `Hey ${name}, just checking in on our ${aptName} tab. You currently have a balance of ${amount.toFixed(2)} ${currency}. Whenever you get a chance!`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-6">
      {/* Quick Invite Share Banner */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--oak-tint)] text-[var(--oak)]">
              <IconSparkles size={12} />
              Quick Join Link
            </span>
            <span className="font-semibold text-sm text-[var(--text)]">
              {activeHousehold?.name || 'Apartment 4B'} Invite Code
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Share this private link with new flatmates to add them instantly to your household.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyInvite}
            className={`btn-spring flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl border transition-all cursor-pointer shadow-xs ${
              copied
                ? 'bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)]'
                : 'bg-[var(--canvas)] text-[var(--text)] border-[var(--border-strong)] hover:bg-[var(--sage-tint)]'
            }`}
          >
            {copied ? (
              <IconCheck size={15} className="animate-icon-pop text-[var(--positive-text)]" />
            ) : (
              <IconCopy size={15} />
            )}
            <span>{copied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          <Button
            onClick={() => openModal('invite')}
            className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs cursor-pointer shadow-sm px-3.5 py-2 rounded-xl"
          >
            <IconUserPlus size={14} className="mr-1" />
            Invite
          </Button>
        </div>
      </div>

      {/* Debt Simplification Visualizer */}
      <div className="card-custom">
        <div className="card-head">
          <div className="flex items-center gap-2">
            <h2 className="card-title-custom">Direct Settlement Matrix</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--sage)]">
              <IconArrowsExchange size={13} />
              Simplified Debts
            </span>
          </div>
          <div className="card-title-sub">Minimal transfer paths</div>
        </div>

        <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isLoadingMatrix ? (
            <div className="text-xs text-[var(--muted)] col-span-2 text-center py-4">Calculating settlement paths...</div>
          ) : settlementPaths.length === 0 ? (
            <div className="text-xs text-[var(--muted)] col-span-2 text-center py-4">All debts are settled!</div>
          ) : (
            settlementPaths.map((path) => (
              <div
                key={path.id}
                className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`avatar-badge ${path.debtorColor} text-xs w-7 h-7`}>
                    {path.debtorAvatar}
                  </span>
                  <div>
                    <div className="text-xs font-medium text-[var(--text)]">
                      {path.debtorName} owes {path.creditorName}
                    </div>
                    <div className="text-[11px] text-[var(--muted)]">{path.contextText}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="mono font-bold text-sm text-[var(--sage)]">
                    +{path.amount.toFixed(2)} {path.currency}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleWhatsAppReminder(path.debtorName, path.amount)}
                    className="text-[10px] text-[var(--oak)] font-medium hover:underline flex items-center gap-0.5 ml-auto cursor-pointer"
                  >
                    <IconBrandWhatsapp size={11} /> Nudge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Household Members List */}
      <div className="card-custom">
        <div className="card-head">
          <h2 className="card-title-custom">Household Members</h2>
          <div className="card-title-sub">{roommates.length} active members</div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {isLoadingRoommates ? (
            <div className="text-xs text-[var(--muted)] text-center py-6">Loading household members...</div>
          ) : (
            roommates.map((rm) => (
              <div
                key={rm.id}
                className="rm-row"
              >
                <span className={`avatar-badge ${rm.avatarColor} shrink-0`} aria-hidden="true">
                  {rm.avatarInitial}
                </span>

                <div className="rm-name-wrap flex-1 min-w-0">
                  <div className="rm-name flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-[var(--text)] truncate">
                      {rm.name}
                    </span>
                    {rm.role === 'ADMIN' ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--oak-tint)] text-[var(--oak-hover)] dark:text-[var(--oak)] font-semibold">
                        <IconShield size={10} />
                        Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--canvas)] text-[var(--muted)] font-medium border border-[var(--border)]">
                        <IconUser size={10} />
                        Member
                      </span>
                    )}
                  </div>
                  <div className="rm-sub text-xs text-[var(--muted)]">{rm.email}</div>
                </div>

                <span
                  className={`pill-balance ${rm.balance >= 0 ? 'pos' : 'neg'} shrink-0 text-xs font-semibold`}
                >
                  {rm.balance >= 0 ? '+' : ''}
                  {rm.balance.toFixed(2)} {rm.currency}
                </span>

                <div className="rm-actions flex items-center gap-1.5 shrink-0">
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
                    onClick={() => openModal('settle')}
                    className="btn-chip"
                  >
                    Settle
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
