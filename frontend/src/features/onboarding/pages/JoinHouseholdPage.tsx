import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconArrowLeft, IconUserPlus } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJoinHouseholdMutation } from '@/features/households/api/useHouseholdsQuery';

export const JoinHouseholdPage: React.FC = () => {
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const joinMutation = useJoinHouseholdMutation();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim();
    if (!cleanCode) return;

    joinMutation.mutate(
      { code: cleanCode },
      {
        onSuccess: () => {
          navigate('/', { replace: true });
        },
      }
    );
  };

  return (
    <div className="card-custom p-6 space-y-6">
      <Link
        to="/onboarding"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        <IconArrowLeft size={14} /> Back to options
      </Link>

      <div className="space-y-1">
        <div className="w-10 h-10 rounded-lg bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center mb-2">
          <IconUserPlus size={20} />
        </div>
        <h1 className="font-serif text-xl font-bold text-[var(--text)]">Join a household</h1>
        <p className="text-xs text-[var(--muted)]">
          Paste the 8-character invite code shared by your roommate to join their flat.
        </p>
      </div>

      {joinMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg">
          {joinMutation.error.message}
        </div>
      )}

      <form onSubmit={handleJoin} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[12.5px] font-medium text-[var(--muted)]">Invite Code</label>
          <Input
            type="text"
            placeholder="e.g. 4B992XYZ"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="uppercase font-mono"
          />
        </div>

        <Button
          type="submit"
          disabled={joinMutation.isPending}
          className="w-full bg-[var(--sage)] hover:bg-[var(--sage)] text-white font-medium py-5 cursor-pointer"
        >
          {joinMutation.isPending ? 'Joining household...' : 'Join Household & Continue'}
        </Button>
      </form>
    </div>
  );
};
