import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { IconBuildingCommunity, IconCheck, IconCoins, IconUserPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { AuthPanel } from '../components/AuthPanel';
import { authApi } from '../api/authApi';
import type { RegisterDto, LoginDto } from '../types';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { householdsApi } from '@/features/households/api/householdsApi';
import { useJoinHouseholdMutation } from '@/features/households';

export const InviteAcceptPage: React.FC = () => {
  const params = useParams<{ inviteToken?: string; token?: string }>();
  const effectiveToken = (params.inviteToken || params.token || 'INVITE').toUpperCase();
  const navigate = useNavigate();

  const { isAuthenticated, user, setAuth } = useAuthStore();
  const { setActiveHousehold, addHousehold } = useHouseholdStore();
  const joinMutation = useJoinHouseholdMutation();

  const [isAccepted, setIsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 1. Authenticated 1-Click Join Handler
  const handleAcceptAuthenticated = async () => {
    try {
      const joined = await joinMutation.mutateAsync({ code: effectiveToken });
      setIsAccepted(true);
      setActiveHousehold(joined.householdId);

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
        navigate('/dashboard', { replace: true });
      }, 800);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to join household with this invite code.';
      toast.error('Unable to accept invitation', {
        description: errorMsg,
      });
    }
  };

  // 2. Unauthenticated Creator Joiner Flow: Register + Join atomically
  const handleRegisterAndJoin = async (dto: RegisterDto) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      // Register with backend
      const userSummary = await authApi.register(dto);

      // Join the invited household
      const joined = await householdsApi.joinWithCode({ code: effectiveToken });

      addHousehold({
        id: joined.householdId,
        name: joined.name,
        role: 'MEMBER',
        currency: typeof joined.currency === 'string' ? joined.currency : 'MAD',
        memberCount: joined.memberCount,
      });

      setAuth(
        {
          id: userSummary.userId,
          name: userSummary.username,
          email: userSummary.email,
        },
        'session-cookie-active'
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D07B30', '#7E9F74', '#F4A261', '#E76F51'],
      });

      toast.success(`Welcome to ${joined.name}, ${userSummary.username}!`, {
        description: 'You are now connected to the household tab.',
      });

      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join with invite code';
      setAuthError(msg);
      toast.error('Unable to join', { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Unauthenticated Sign In + Join
  const handleLoginAndJoin = async (dto: LoginDto) => {
    setIsSubmitting(true);
    setAuthError(null);
    try {
      const userSummary = await authApi.login(dto);
      const joined = await householdsApi.joinWithCode({ code: effectiveToken });

      addHousehold({
        id: joined.householdId,
        name: joined.name,
        role: 'MEMBER',
        currency: typeof joined.currency === 'string' ? joined.currency : 'MAD',
        memberCount: joined.memberCount,
      });

      setAuth(
        {
          id: userSummary.userId,
          name: userSummary.username,
          email: userSummary.email,
        },
        'session-cookie-active'
      );

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D07B30', '#7E9F74', '#F4A261', '#E76F51'],
      });

      toast.success(`Welcome to ${joined.name}, ${userSummary.username}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign in failed';
      setAuthError(msg);
      toast.error('Sign in failed', { description: msg });
    } finally {
      setIsSubmitting(false);
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
            You have been invited to connect to a shared space with code <strong className="text-[var(--text)] font-mono">{effectiveToken}</strong>.
          </p>
        </div>

        {/* Space Stats Pill */}
        <div className="p-3 rounded-2xl bg-[var(--canvas)] border border-[var(--border)] text-xs text-center">
          <div className="flex items-center gap-2 justify-center">
            <IconCoins size={15} className="text-[var(--oak)]" />
            <span className="text-[var(--text)] font-semibold">Shared Ledger, Pantry Stock & Auto-Bills</span>
          </div>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4 pt-2">
            <div className="text-xs text-[var(--muted)] bg-[var(--sage-tint)] p-3 rounded-xl text-[var(--sage)] border border-[var(--sage)]/30">
              Signed in as <strong className="text-[var(--text)]">{user?.name}</strong> ({user?.email})
            </div>

            <Button
              onClick={handleAcceptAuthenticated}
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
          <div className="space-y-3 pt-1 text-left">
            <div className="text-xs text-[var(--muted)] text-center mb-2">
              Create an account or sign in to join this household immediately:
            </div>
            <AuthPanel
              initialMode="register"
              allowToggleMode={true}
              submitLabel={`Join with Code (${effectiveToken})`}
              isSubmitting={isSubmitting}
              errorMessage={authError}
              onSubmitRegister={handleRegisterAndJoin}
              onSubmitLogin={handleLoginAndJoin}
            />
          </div>
        )}
      </div>
    </div>
  );
};
