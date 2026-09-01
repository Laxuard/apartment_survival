import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  IconHome,
  IconBuildingCommunity,
  IconArrowLeft,
  IconDoor,
  IconCompass,
} from '@tabler/icons-react';

import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const homePath = activeHouseholdId ? '/dashboard' : user ? '/hub' : '/';

  return (
    <div className="min-h-screen bg-[var(--canvas)] flex flex-col justify-between p-4 sm:p-8 select-none animate-fade-in">
      {/* Header bar */}
      <header className="flex items-center justify-between max-w-4xl w-full mx-auto py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--oak)] to-[#D07B30] text-white flex items-center justify-center font-bold shadow-xs">
            <IconBuildingCommunity size={16} />
          </div>
          <span className="font-serif font-bold text-sm text-[var(--text)]">Apartment Survival</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-xs rounded-xl flex items-center gap-1 cursor-pointer"
        >
          <IconArrowLeft size={14} />
          <span>Go Back</span>
        </Button>
      </header>

      {/* Main 404 Hero Card */}
      <main className="flex-1 flex items-center justify-center my-auto py-8">
        <div className="max-w-md w-full text-center space-y-6">
          {/* Visual Door Badge */}
          <div className="relative inline-flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-[var(--oak-tint)]/60 border border-[var(--oak)]/30 text-[var(--oak)] flex items-center justify-center shadow-lg relative z-10 animate-bounce-subtle">
              <IconDoor size={44} strokeWidth={1.75} />
            </div>
            <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[var(--card)] border border-[var(--border-strong)] text-[11px] font-mono font-bold text-[var(--oak)] shadow-sm z-20">
              404
            </div>
          </div>

          {/* Heading & Themed Copy */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] tracking-tight">
              Wrong Address for Home
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-sm mx-auto">
              Looks like apartment 404 doesn&apos;t exist in this building. The roommate or hallway you&apos;re looking for might have moved or the address has a typo.
            </p>
          </div>

          {/* Quick Navigation Destination Tiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left pt-2">
            <button
              type="button"
              onClick={() => navigate(homePath)}
              className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--oak)] hover:bg-[var(--oak-tint)]/15 transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--canvas)] border border-[var(--border)] group-hover:border-[var(--oak)]/40 flex items-center justify-center text-[var(--oak)] shrink-0">
                <IconHome size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--oak)] transition-colors">
                  Take Me Home
                </div>
                <div className="text-[10.5px] text-[var(--muted)] truncate">
                  Return to active dashboard
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => navigate('/hub')}
              className="p-3.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] hover:border-[var(--oak)] hover:bg-[var(--oak-tint)]/15 transition-all flex items-center gap-3 group cursor-pointer shadow-2xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--canvas)] border border-[var(--border)] group-hover:border-[var(--oak)]/40 flex items-center justify-center text-[var(--oak)] shrink-0">
                <IconBuildingCommunity size={16} />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--oak)] transition-colors">
                  Command Hub
                </div>
                <div className="text-[10.5px] text-[var(--muted)] truncate">
                  Switch or manage living spaces
                </div>
              </div>
            </button>
          </div>

          {/* Fallback Action */}
          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => navigate(homePath)}
              className="px-6 rounded-xl text-xs font-semibold shadow-sm cursor-pointer"
            >
              <IconCompass size={14} className="mr-1.5" />
              <span>Back to Shared Ledger</span>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-[11px] text-[var(--muted)] py-2">
        <span>Apartment Survival Building Directory · Room 404 Not Found</span>
      </footer>
    </div>
  );
};
