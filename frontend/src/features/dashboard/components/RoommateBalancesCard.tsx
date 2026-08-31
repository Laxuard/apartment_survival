import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHouseholdLedger } from '@/features/roommates';
import { useUIStore } from '@/stores/useUIStore';
import { IconUserPlus, IconUsers } from '@tabler/icons-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const RoommateBalancesCard: React.FC = () => {
  const navigate = useNavigate();
  const { openModal, openSettleModal } = useUIStore();
  const ledger = useHouseholdLedger();
  const peers = ledger.peers;

  return (
    <section
      className="min-h-[190px] bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-5 flex flex-col shadow-sm select-none"
      aria-labelledby="balances-title"
    >
      {/* 1. Header with Whisper Divider (Persistently rendered) */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-[var(--border)]/40 dark:border-white/5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-[var(--text)]" id="balances-title">
            Roommate Balances
          </h3>
          <span className="text-xs text-[var(--muted)] font-medium">
            {ledger.isLoading ? '...' : `${peers.length} flatmates`}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/roommates')}
          className="text-xs text-[var(--oak)] hover:text-[var(--oak-hover)] font-medium cursor-pointer"
        >
          View all &rarr;
        </button>
      </div>

      {/* 2. Dense Vertical Grid with Height-Matched Skeletons */}
      <div className="flex-1 flex flex-col justify-center">
        {ledger.isLoading ? (
          // 3-row skeleton matching exact empty/populated height (~190px)
          <div className="flex-1 flex flex-col justify-center space-y-3 py-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-1">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-8 h-8 rounded-lg skeleton-warm shrink-0" />
                  <Skeleton className="w-24 h-3.5 skeleton-warm" />
                </div>
                <Skeleton className="w-16 h-6 rounded-md skeleton-warm" />
              </div>
            ))}
          </div>
        ) : peers.length === 0 ? (
          // Perfectly Centered N=0 Empty State
          <div className="animate-fade-up flex-1 flex flex-col items-center justify-center text-center space-y-2 my-auto py-2">
            <div className="w-12 h-12 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] flex items-center justify-center">
              <IconUsers size={22} />
            </div>
            <div className="space-y-0.5 max-w-xs">
              <div className="font-bold text-xs text-[var(--text)]">You&apos;re living solo</div>
              <p className="text-[11px] text-[var(--muted)]">
                Invite flatmates to unlock shared splitting and tabs.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => openModal('invite')}
              className="mt-4 btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-[11px] font-semibold px-3 py-1.5 h-7 rounded-lg shadow-sm cursor-pointer inline-flex items-center gap-1"
            >
              <IconUserPlus size={13} />
              <span>Invite Flatmates</span>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col gap-2">
              {peers.map((rm, index) => (
                <div
                  key={rm.id}
                  onClick={() => openSettleModal(rm)}
                  style={{ animationDelay: `${index * 45}ms` }}
                  className="animate-fade-up flex items-center justify-between gap-3 p-2 -mx-2 rounded-lg hover:bg-[var(--canvas)]/80 dark:hover:bg-white/[0.03] cursor-pointer group transition-all duration-200"
                  title={`Click to record settlement with ${rm.name}`}
                >
                  {/* Left: 32x32 Avatar + Roommate First Name */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${rm.avatarColor === 'sage'
                        ? 'bg-[var(--sage-tint)] text-[var(--sage)]'
                        : 'bg-[var(--oak-tint)] text-[var(--oak)]'
                        }`}
                    >
                      {rm.avatarInitial}
                    </span>
                    <span className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--oak)] transition-colors truncate">
                      {rm.name}
                    </span>
                  </div>

                  {/* Right: font-mono tabular-nums text-xs badge */}
                  <span
                    className={`font-mono tabular-nums text-xs font-medium px-2 py-1 rounded-md transition-transform group-hover:translate-x-[-2px] ${rm.balance > 0
                      ? 'bg-[var(--positive-bg)] text-[var(--positive-text)]'
                      : rm.balance < 0
                        ? 'bg-[var(--negative-bg)] text-[var(--negative-text)]'
                        : 'bg-[var(--canvas)] text-[var(--muted)]'
                      }`}
                  >
                    {rm.balance > 0 ? '+' : ''}
                    {rm.balance.toFixed(2)} {ledger.currency}
                  </span>
                </div>
              ))}
            </div>

            {/* Flex-Grow Ghost CTA when fewer than 3 flatmates */}
            {peers.length < 3 && (
              <button
                type="button"
                onClick={() => openModal('invite')}
                style={{ animationDelay: `${peers.length * 45}ms` }}
                className="animate-fade-up flex-1 w-full min-h-[44px] mt-2.5 rounded-xl border border-dashed border-[var(--border)] dark:border-white/10 flex items-center justify-center gap-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--oak)]/50 hover:bg-[var(--oak-tint)]/20 dark:hover:bg-[var(--oak)]/5 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--canvas)] dark:bg-white/5 group-hover:bg-[var(--oak-tint)] dark:group-hover:bg-[var(--oak)]/20 flex items-center justify-center transition-colors shadow-2xs">
                  <IconUserPlus size={13} className="text-[var(--muted)] group-hover:text-[var(--oak)] transition-colors" />
                </div>
                <span>Invite another flatmate</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
