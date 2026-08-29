import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { IconBuildingCommunity, IconCheck, IconUserPlus, IconCoins } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/useAuthStore';
import { useJoinHouseholdMutation } from '@/features/households';

export const InviteAcceptPage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const joinMutation = useJoinHouseholdMutation();
  const [isAccepted, setIsAccepted] = useState(false);

  const handleAccept = async () => {
    try {
      const joined = await joinMutation.mutateAsync({ code: token || 'APARTMENT' });
      setIsAccepted(true);

      // Trigger Confetti Celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D07B30', '#7E9F74', '#F4A261', '#E76F51'],
      });

      toast.success(`Welcome to ${joined.name}!`, {
        description: 'You are now an active member of this household ledger.',
      });

      setTimeout(() => {
        navigate('/', { replace: true });
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to join household with this invite code.';
      toast.error('Unable to accept invitation', {
        description: errorMsg,
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--canvas)] relative overflow-hidden select-none">
      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[var(--oak)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md card-custom shadow-2xl border border-[var(--border-strong)] bg-[var(--card)]/95 backdrop-blur-md rounded-3xl text-center p-6 sm:p-8 space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--oak)] to-[#D07B30] text-white flex items-center justify-center mx-auto shadow-md">
          <IconBuildingCommunity size={32} />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--oak-tint)] text-[var(--oak)] border border-[var(--oak)]/30">
            Household Invitation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text)] tracking-tight">
            Join Household
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xs mx-auto">
            You have been invited to connect to a shared living space with code <strong className="text-[var(--text)]">{token || 'APARTMENT'}</strong>.
          </p>
        </div>

        {/* Space Stats Pill */}
        <div className="p-3 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-center">
          <div className="flex items-center gap-2 justify-center">
            <IconCoins size={15} className="text-[var(--oak)]" />
            <span className="text-[var(--text)] font-semibold">Shared Ledger & Pantry Stock</span>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4 pt-2">
            <div className="text-xs text-[var(--muted)] bg-[var(--sage-tint)] p-3 rounded-xl text-[var(--sage)] border border-[var(--sage)]/30">
              Signed in as <strong className="text-[var(--text)]">{user?.name}</strong> ({user?.email})
            </div>

            <Button
              onClick={handleAccept}
              disabled={joinMutation.isPending || isAccepted}
              className="btn-tactile w-full h-11 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2"
            >
              {isAccepted ? (
                <span className="flex items-center justify-center gap-2">
                  <IconCheck size={18} /> Accepted! Entering flat...
                </span>
              ) : joinMutation.isPending ? (
                'Connecting to space...'
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IconUserPlus size={18} /> Accept Invitation & Join
                </span>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <p className="text-xs text-[var(--muted)]">
              Sign in or create an account to accept this household invite:
            </p>

            <Button
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(`/invite/${token}`)}`)}
              className="btn-tactile w-full h-10.5 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer"
            >
              Sign In to Accept
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/register?redirect=${encodeURIComponent(`/invite/${token}`)}`)}
              className="w-full h-10.5 rounded-xl border border-[var(--border-strong)] bg-[var(--canvas)] hover:bg-[var(--card)] text-xs sm:text-sm font-semibold text-[var(--text)] cursor-pointer"
            >
              Create New Account
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
