import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_CURRENCY, getClientTimezone } from '@/domain';
import { householdsApi } from '@/features/households/api/householdsApi';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { IconCheck, IconEye, IconEyeOff, IconUserPlus } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../api/authApi';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);
  const { hasDraft, draft, clearDraft } = useOnboardingStore();
  const redirectUrl = searchParams.get('redirect') || '/dashboard';

  const isPasswordLongEnough = password.length >= 8;
  const hasNumbers = /\d/.test(password);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Execute backend registration API & create server session
      const userSummary = await authApi.register({
        email: email.trim(),
        username: username.trim(),
        password,
      });

      // 2. If user came from reverse onboarding with a draft flat, create household now
      if (hasDraft && draft.householdName.trim()) {
        try {
          const created = await householdsApi.createHousehold({
            name: draft.householdName.trim(),
            currency: draft.currency || DEFAULT_CURRENCY,
            timezone: draft.timezone || getClientTimezone(),
            maxMembers: Math.max(8, draft.roommateNames.length + 1),
          });

          setActiveHousehold(created.householdId);
          clearDraft();
          toast.success(`Welcome to ${created.name}, ${userSummary.username}!`, {
            description: 'Your household is saved and your dashboard is live.',
          });
        } catch (hErr) {
          console.error('Failed to create draft household', hErr);
        }
      } else {
        toast.success(`Account created! Welcome, ${userSummary.username}`);
      }

      // 3. Mark auth session as active in Zustand
      setAuth({
        id: userSummary.userId,
        name: userSummary.username,
        email: userSummary.email,
      });
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await queryClient.invalidateQueries({ queryKey: ['user', 'households'] });

      // 4. Smoothly navigate into dashboard or target redirect
      navigate(redirectUrl && redirectUrl !== '/' ? redirectUrl : '/dashboard', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to register account';
      setErrorMessage(msg);
      toast.error('Registration failed', {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Create your account</h2>
        <p className="text-xs text-[var(--muted)]">
          {hasDraft && draft.householdName
            ? `Save "${draft.householdName}" & access your shared ledger`
            : 'Join Apartment Survival to split bills & track supplies'}
        </p>
      </div>

      {errorMessage && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-3 rounded-xl border border-[var(--negative-text)]/20 animate-fade-up">
          {errorMessage}
        </div>
      )}

      {/* Semantic Accessible Form */}
      <form onSubmit={handleRegister} className="space-y-4" noValidate={false}>
        <div className="space-y-1.5">
          <label htmlFor="reg-username" className="text-xs font-semibold text-[var(--text)] block">
            Username / Display Name
          </label>
          <Input
            id="reg-username"
            type="text"
            name="username"
            autoComplete="username"
            placeholder="e.g. Sarah"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-xs font-semibold text-[var(--text)] block">
            Email address
          </label>
          <Input
            id="reg-email"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-password" className="text-xs font-semibold text-[var(--text)] block">
            Password
          </label>
          <div className="relative">
            <Input
              id="reg-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 pr-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer p-1 rounded-lg transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>

          {/* Micro validation checklist */}
          <div className="flex items-center gap-3 pt-1 text-[10.5px]">
            <span className={`flex items-center gap-1 font-medium ${isPasswordLongEnough ? 'text-[var(--positive-text)]' : 'text-[var(--muted)]'}`}>
              <IconCheck size={12} /> 8+ chars
            </span>
            <span className={`flex items-center gap-1 font-medium ${hasNumbers ? 'text-[var(--positive-text)]' : 'text-[var(--muted)]'}`}>
              <IconCheck size={12} /> Number included
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !username.trim() || !email.trim() || !isPasswordLongEnough}
          className="btn-tactile w-full h-11 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)]"
        >
          {isSubmitting ? (
            <span>Setting up space & account...</span>
          ) : (
            <>
              <IconUserPlus size={16} />
              <span>{hasDraft ? 'Save Flat & Launch' : 'Create Account & Continue'}</span>
            </>
          )}
        </Button>

        <div className="text-center pt-2 text-xs text-[var(--muted)]">
          Already have an account?{' '}
          <Link
            to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
            className="font-bold text-[var(--oak)] hover:underline"
          >
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};
