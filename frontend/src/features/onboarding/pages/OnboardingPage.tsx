import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconPlus, IconUserPlus, IconMail, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { usePendingInvitesQuery, useAcceptInviteMutation } from '@/features/households';
import { toast } from 'sonner';

export const OnboardingPage: React.FC = () => {
  const { data: pendingInvites = [] } = usePendingInvitesQuery();
  const acceptInviteMutation = useAcceptInviteMutation();
  const navigate = useNavigate();

  const handleAcceptInvite = async (inviteId: string, householdName: string) => {
    try {
      await acceptInviteMutation.mutateAsync(inviteId);
      toast.success(`Joined ${householdName}!`, {
        description: 'Your household dashboard is ready.',
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to accept invite', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--oak-tint)] text-[var(--oak)] text-xs font-semibold border border-[var(--oak)]/30">
          <IconSparkles size={13} />
          <span>Apartment Setup</span>
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
          Welcome to Apartment Survival
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] max-w-md mx-auto">
          Start fresh by creating a new shared space for your flatmates, or join an existing flat using an invite code.
        </p>
      </div>

      {/* Smart Pending Inbox Invite Detection */}
      {pendingInvites.length > 0 && (
        <div className="p-4 rounded-2xl bg-[var(--oak-tint)] border border-[var(--border-strong)] space-y-3 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--oak-hover)] dark:text-[var(--oak)] uppercase tracking-wider">
            <IconMail size={16} />
            <span>Pending Household Invitation</span>
          </div>
          {pendingInvites.map((invite) => (
            <div
              key={invite.inviteId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-xs"
            >
              <div>
                You've been invited to join <strong className="text-[var(--text)] font-semibold">{invite.householdName}</strong> by {invite.inviterName}.
              </div>
              <button
                type="button"
                disabled={acceptInviteMutation.isPending}
                onClick={() => handleAcceptInvite(invite.inviteId, invite.householdName)}
                className="btn-tactile px-4 py-2 text-xs font-semibold rounded-xl bg-[var(--oak)] text-white hover:bg-[var(--oak-hover)] cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>{acceptInviteMutation.isPending ? 'Joining...' : 'Accept & Enter'}</span>
                <IconArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <Link
          to="/onboarding/create"
          className="card-custom p-6 rounded-3xl border border-[var(--border)] hover:border-[var(--oak)] bg-[var(--card)] hover:bg-[var(--oak-tint)]/40 transition-all flex flex-col items-center text-center space-y-3 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="w-13 h-13 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
            <IconPlus size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-sm sm:text-base text-[var(--text)] group-hover:text-[var(--oak)] transition-colors">
              Create New Apartment
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Start a new household ledger, select currency (MAD, USD, EUR, GBP), and invite roommates.
            </p>
          </div>
          <div className="pt-2 text-xs font-semibold text-[var(--oak)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Get Started</span>
            <IconArrowRight size={14} />
          </div>
        </Link>

        <Link
          to="/onboarding/join"
          className="card-custom p-6 rounded-3xl border border-[var(--border)] hover:border-[var(--sage)] bg-[var(--card)] hover:bg-[var(--sage-tint)]/40 transition-all flex flex-col items-center text-center space-y-3 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="w-13 h-13 rounded-2xl bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xs">
            <IconUserPlus size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="font-bold text-sm sm:text-base text-[var(--text)] group-hover:text-[var(--sage)] transition-colors">
              Join Existing Flat
            </h2>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Enter an 8-character invite code provided by your flatmate to connect to their space.
            </p>
          </div>
          <div className="pt-2 text-xs font-semibold text-[var(--sage)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            <span>Enter Invite Code</span>
            <IconArrowRight size={14} />
          </div>
        </Link>
      </div>
    </div>
  );
};
