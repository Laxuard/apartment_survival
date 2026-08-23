import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const registerMutation = useRegister();
  const redirectUrl = searchParams.get('redirect') || '/';

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) return;

    registerMutation.mutate(
      {
        email,
        username,
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
    <form onSubmit={handleRegister} className="space-y-4 p-2">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text)]">Create your account</h2>
        <p className="text-xs text-[var(--muted)]">Join Apartment Survival to track expenses & restocks</p>
      </div>

      {registerMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg">
          {registerMutation.error.message}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-[12.5px] font-medium text-[var(--muted)]">Username</label>
        <Input
          type="text"
          placeholder="e.g. laxuard"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-[12.5px] font-medium text-[var(--muted)]">Email address</label>
        <Input
          type="email"
          placeholder="name@apartment.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-[12.5px] font-medium text-[var(--muted)]">Password (min 8 characters)</label>
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
        disabled={registerMutation.isPending}
        className="w-full bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-medium cursor-pointer"
      >
        {registerMutation.isPending ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="text-center pt-2 text-xs text-[var(--muted)]">
        Already have an account?{' '}
        <Link
          to={`/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`}
          className="font-semibold text-[var(--oak)] hover:underline"
        >
          Sign in
        </Link>
      </div>
    </form>
  );
};
