import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconArrowRight, IconEye, IconEyeOff, IconUserCheck } from '@tabler/icons-react';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useLogin } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loginMutation = useLogin();
  const redirectUrl = searchParams.get('redirect') || '/hub';

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !password) return;

    loginMutation.mutate(
      {
        login: loginIdentifier.trim(),
        password,
      },
      {
        onSuccess: (data) => {
          toast.success(`Welcome back, ${data.username}!`, {
            description: 'Signed in successfully to your household.',
          });
          navigate(redirectUrl, { replace: true });
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Welcome back</h2>
        <p className="text-xs text-[var(--muted)]">Sign in to your household ledger and shared tab</p>
      </div>

      {loginMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-3 rounded-xl border border-[var(--negative-text)]/20">
          {loginMutation.error.message}
        </div>
      )}

      {/* Semantic Accessible Form */}
      <form onSubmit={handleLogin} className="space-y-4" noValidate={false}>
        <div className="space-y-1.5">
          <label htmlFor="login-identifier" className="text-xs font-semibold text-[var(--text)] block">
            Email or Username
          </label>
          <Input
            id="login-identifier"
            type="text"
            name="username"
            autoComplete="username"
            placeholder="name@example.com or username"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="text-xs font-semibold text-[var(--text)] block">
              Password
            </label>
          </div>
          <div className="relative">
            <Input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
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
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending || !loginIdentifier.trim() || !password}
          className="btn-tactile w-full h-11 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)]"
        >
          {loginMutation.isPending ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <IconUserCheck size={16} />
              <span>Sign In to Household</span>
              <IconArrowRight size={15} />
            </>
          )}
        </Button>

        <div className="text-center pt-2 text-xs text-[var(--muted)]">
          Don&apos;t have a flat yet?{' '}
          <Link
            to="/onboarding"
            className="font-bold text-[var(--oak)] hover:underline"
          >
            Set up your flat in 60s
          </Link>
        </div>
      </form>
    </div>
  );
};
