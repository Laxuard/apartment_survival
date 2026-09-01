import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { IconKey, IconUserPlus } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useJoinHouseholdMutation } from '@/features/households';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

interface JoinHouseholdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JoinHouseholdModal: React.FC<JoinHouseholdModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);
  const joinMutation = useJoinHouseholdMutation();

  const [code, setCode] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) return;

    try {
      const res = await joinMutation.mutateAsync({ code: cleanCode });
      toast.success(`Joined "${res.name}"!`, {
        description: 'You are now connected to the household.',
      });
      setCode('');
      onOpenChange(false);
      setActiveHousehold(res.householdId);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Invalid or expired invite code';
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[480px] p-6 sm:p-8 space-y-6">
        {/* Modal Header with Integrated Ambient Badge */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sage)]/10 text-[var(--sage)] border border-[var(--sage)]/25 shadow-2xs">
            <IconUserPlus size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)] tracking-tight">
              Join Existing Household
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Enter the 8-character code shared by your flatmate or host.
            </p>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="joinCodeInput" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
              <IconKey size={14} className="text-[var(--sage)]" />
              <span>Invite Code</span>
            </label>
            <Input
              id="joinCodeInput"
              type="text"
              placeholder="e.g. 4B992XYZ"
              value={code}
              maxLength={16}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              autoFocus
              className="h-12 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-base font-mono font-bold tracking-widest text-center uppercase focus-visible:ring-2 focus-visible:ring-[var(--sage)]/40 focus-visible:border-[var(--sage)]"
            />
          </div>

          <div className="pt-2 space-y-2.5">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-xl text-xs sm:text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={joinMutation.isPending || !code.trim()}
                className="flex-1 h-12 rounded-xl bg-[var(--sage)] hover:bg-[#688E5E] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {joinMutation.isPending ? 'Verifying...' : 'Join Household →'}
              </Button>
            </div>
            <p className="text-center text-[11px] text-[var(--muted)] font-medium">
              ⚡ You will immediately access the shared ledger and pantry upon joining.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
