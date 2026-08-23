import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconPlus, IconUserPlus, IconMail } from '@tabler/icons-react';
import { usePendingInvitesQuery } from '@/features/households/api/useHouseholdsQuery';
import { householdsApi } from '@/features/households/api/householdsApi';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useQueryClient } from '@tanstack/react-query';

export const OnboardingPage: React.FC = () => {
  const { data: pendingInvites = [] } = usePendingInvitesQuery();
  const addHousehold = useHouseholdStore((s) => s.addHousehold);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      const joined = await householdsApi.acceptDirectInvite(inviteId);
      addHousehold({
        id: joined.householdId,
        name: joined.name,
        role: 'MEMBER',
        currency: typeof joined.currency === 'string' ? joined.currency : 'MAD',
        memberCount: joined.memberCount,
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'households'] });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to accept invite', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-serif text-2xl font-bold text-[var(--text)]">
          Welcome to Apartment Survival
        </h1>
        <p className="text-xs text-[var(--muted)]">
          To get started, create a new household for your flatmates or join an existing one.
        </p>
      </div>

      {/* Smart Pending Inbox Invite Detection */}
      {pendingInvites.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--oak-tint)] border border-[var(--border-strong)] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--oak-hover)] dark:text-[var(--oak)]">
            <IconMail size={16} />
            <span>Pending Household Invitation</span>
          </div>
          {pendingInvites.map((invite) => (
            <div
              key={invite.inviteId}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <div>
                You've been invited to join <strong className="text-[var(--text)]">{invite.householdName}</strong> by {invite.inviterName}
              </div>
              <button
                type="button"
                onClick={() => handleAcceptInvite(invite.inviteId)}
                className="btn-primary px-3 py-1.5 text-xs rounded-lg whitespace-nowrap cursor-pointer"
              >
                Accept & Enter
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <Link
          to="/onboarding/create"
          className="card-custom p-6 flex flex-col items-center text-center space-y-3 hover:border-[var(--oak)] transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <IconPlus size={24} />
          </div>
          <h2 className="font-semibold text-sm text-[var(--text)]">Create New Apartment</h2>
          <p className="text-xs text-[var(--muted)]">
            Start a new household ledger, configure currency, and invite your flatmates.
          </p>
        </Link>

        <Link
          to="/onboarding/join"
          className="card-custom p-6 flex flex-col items-center text-center space-y-3 hover:border-[var(--sage)] transition-colors group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-xl bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center group-hover:scale-105 transition-transform">
            <IconUserPlus size={24} />
          </div>
          <h2 className="font-semibold text-sm text-[var(--text)]">Join Existing Flat</h2>
          <p className="text-xs text-[var(--muted)]">
            Enter an invite code or link provided by your roommate to join their ledger.
          </p>
        </Link>
      </div>
    </div>
  );
};
