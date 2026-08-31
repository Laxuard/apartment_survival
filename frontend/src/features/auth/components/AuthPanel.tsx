import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconCheck, IconEye, IconEyeOff, IconUserCheck, IconUserPlus } from '@tabler/icons-react';
import React, { useState } from 'react';
import type { LoginDto, RegisterDto } from '../types';

export interface AuthPanelProps {
  initialMode?: 'register' | 'login';
  allowToggleMode?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  onSubmitRegister: (dto: RegisterDto) => Promise<void> | void;
  onSubmitLogin?: (dto: LoginDto) => Promise<void> | void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({
  initialMode = 'register',
  allowToggleMode = true,
  submitLabel,
  isSubmitting = false,
  errorMessage = null,
  onSubmitRegister,
  onSubmitLogin,
}) => {
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordLongEnough = password.length >= 8;
  const hasNumbers = /\d/.test(password);

  const isFormValid =
    mode === 'register'
      ? username.trim().length > 0 && email.trim().length > 0 && isPasswordLongEnough
      : email.trim().length > 0 && password.length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    if (mode === 'register') {
      await onSubmitRegister({
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } else if (onSubmitLogin) {
      await onSubmitLogin({
        login: email.trim(),
        password,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher Tabs (if toggling is allowed) */}
      {allowToggleMode && onSubmitLogin && (
        <div className="flex p-1 rounded-2xl bg-[var(--canvas)] border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${mode === 'register'
                ? 'bg-[var(--card)] text-[var(--text)] shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
          >
            Create New Account
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${mode === 'login'
                ? 'bg-[var(--card)] text-[var(--text)] shadow-xs font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
          >
            Sign In Existing
          </button>
        </div>
      )}

      {/* Error Message Box */}
      {errorMessage && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-3 rounded-xl border border-[var(--negative-text)]/20 animate-fade-up">
          {errorMessage}
        </div>
      )}

      {/* Semantic Accessible Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate={false}>
        {mode === 'register' && (
          <div className="space-y-1.5">
            <label htmlFor="auth-username" className="text-xs font-semibold text-[var(--text)] block">
              Username / Display Name
            </label>
            <Input
              id="auth-username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="e.g. Sarah, Alex, Omar"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="text-xs font-semibold text-[var(--text)] block">
            {mode === 'register' ? 'Email Address' : 'Email or Username'}
          </label>
          <Input
            id="auth-email"
            type={mode === 'register' ? 'email' : 'text'}
            name="email"
            autoComplete={mode === 'register' ? 'email' : 'username'}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs sm:text-sm px-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--oak)]/50 focus-visible:border-[var(--oak)] transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="auth-password" className="text-xs font-semibold text-[var(--text)] block">
            Password
          </label>
          <div className="relative">
            <Input
              id="auth-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
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

          {/* Validation Checklist (Register only) */}
          {mode === 'register' && (
            <div className="flex items-center gap-3 pt-0.5 text-[10.5px]">
              <span className={`flex items-center gap-1 font-medium ${isPasswordLongEnough ? 'text-[var(--positive-text)]' : 'text-[var(--muted)]'}`}>
                <IconCheck size={12} /> 8+ chars
              </span>
              <span className={`flex items-center gap-1 font-medium ${hasNumbers ? 'text-[var(--positive-text)]' : 'text-[var(--muted)]'}`}>
                <IconCheck size={12} /> Number included
              </span>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="btn-tactile w-full h-11.5 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[var(--oak)] mt-2"
        >
          {isSubmitting ? (
            <span>Processing...</span>
          ) : (
            <>
              {mode === 'register' ? <IconUserPlus size={16} /> : <IconUserCheck size={16} />}
              <span>{submitLabel || (mode === 'register' ? 'Create Account & Continue' : 'Sign In')}</span>
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
