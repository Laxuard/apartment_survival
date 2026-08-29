import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { IconArrowLeft, IconUserPlus, IconKey } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJoinHouseholdMutation } from '@/features/households';

export const JoinHouseholdPage: React.FC = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const joinMutation = useJoinHouseholdMutation();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    joinMutation.mutate(
      { code: cleanCode },
      {
        onSuccess: (data) => {
          toast.success(`Joined "${data.name}"!`, {
            description: 'You are now connected to the household tab.',
          });
          navigate('/', { replace: true });
        },
      }
    );
  };

  return (
    <div className="card-custom p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-6">
      <Link
        to="/onboarding"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        <IconArrowLeft size={14} /> Back to options
      </Link>

      <div className="space-y-1.5">
        <div className="w-11 h-11 rounded-2xl bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center mb-1 shadow-2xs">
          <IconUserPlus size={22} />
        </div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
          Join a household
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Paste the 8-character invite code shared by your flatmate or landlord.
        </p>
      </div>

      {joinMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-3 rounded-xl border border-[var(--negative-text)]/20">
          {joinMutation.error.message}
        </div>
      )}

      <form onSubmit={handleJoin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
            <IconKey size={14} className="text-[var(--sage)]" />
            <span>8-Character Invite Code</span>
          </label>

          <Input
            type="text"
            placeholder="e.g. 4B992XYZ"
            value={code}
            maxLength={10}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            className="h-12 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-base font-mono tracking-widest text-center uppercase"
          />
        </div>

        <Button
          type="submit"
          disabled={joinMutation.isPending || !code.trim()}
          className="btn-tactile w-full h-11 rounded-xl bg-[var(--sage)] hover:bg-[#688E5E] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {joinMutation.isPending ? 'Connecting to apartment...' : 'Join Household & Enter Dashboard'}
        </Button>
      </form>
    </div>
  );
};
