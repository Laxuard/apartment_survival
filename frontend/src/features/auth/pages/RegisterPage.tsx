import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { IconEye, IconEyeOff, IconUserPlus, IconCheck } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRegister } from '../hooks/useAuth';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const registerMutation = useRegister();
  const redirectUrl = searchParams.get('redirect') || '/';

  const isPasswordLongEnough = password.length >= 8;
  const hasNumbers = /\d/.test(password);

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
        onSuccess: (data) => {
          toast.success(`Account created! Welcome, ${data.username}`, {
            description: 'You can now set up or join an apartment.',
          });
          navigate(redirectUrl, { replace: true });
        },
      }
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-[var(--text)] tracking-tight">Create your account</h2>
        <p className="text-xs text-[var(--muted)]">Join Apartment Survival to split bills & track supplies</p>
      </div>

      {registerMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-3 rounded-xl border border-[var(--negative-text)]/20">
          {registerMutation.error.message}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] block">Username / Display Name</label>
          <Input
            type="text"
            placeholder="e.g. Sarah"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="h-10 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] block">Email address</label>
          <Input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] block">Password</label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
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
          disabled={registerMutation.isPending}
          className="btn-tactile w-full h-10.5 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {registerMutation.isPending ? (
            <span>Creating account...</span>
          ) : (
            <>
              <IconUserPlus size={16} />
              <span>Create Account & Continue</span>
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
