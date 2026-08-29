import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { IconEye, IconEyeOff, IconUserCheck, IconArrowRight } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const loginMutation = useLogin();
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !password) return;

    loginMutation.mutate(
      {
        login: loginIdentifier,
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

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] block">Email or Username</label>
          <Input
            type="text"
            placeholder="name@example.com"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            required
            className="h-10 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text)] block">Password</label>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loginMutation.isPending}
          className="btn-tactile w-full h-10.5 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2"
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
          Don't have an account?{' '}
          <Link
            to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
            className="font-bold text-[var(--oak)] hover:underline"
          >
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
};
