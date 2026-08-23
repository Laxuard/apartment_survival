import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogin } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
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
        onSuccess: () => {
          navigate(redirectUrl, { replace: true });
        },
      }
    );
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 p-2">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text)]">Welcome back</h2>
        <p className="text-xs text-[var(--muted)]">Enter your credentials to access your household</p>
      </div>

      {loginMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg">
          {loginMutation.error.message}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[12.5px] font-medium text-[var(--muted)]">Email or Username</label>
        <Input
          type="text"
          placeholder="name@apartment.com"
          value={loginIdentifier}
          onChange={(e) => setLoginIdentifier(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-[12.5px] font-medium text-[var(--muted)]">Password</label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-medium cursor-pointer"
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
      </Button>

      <div className="text-center pt-2 text-xs text-[var(--muted)]">
        Don't have an account?{' '}
        <Link
          to={`/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
          className="font-semibold text-[var(--oak)] hover:underline"
        >
          Sign up
        </Link>
      </div>
    </form>
  );
};
