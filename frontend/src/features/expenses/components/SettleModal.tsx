import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useCreateSettlementMutation } from '@/features/expenses/hooks/useExpensesQueries';

const SETTLE_OPTIONS = [
  { value: 'user-bob', label: 'Bob — owes you 300.00 MAD' },
  { value: 'user-alice', label: 'Alice — owes you 150.00 MAD' },
] as const;

export const SettleModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'settle';
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const [settleWith, setSettleWith] = useState<string>('user-bob');
  const [amount, setAmount] = useState('300.00');

  const createSettlementMutation = useCreateSettlementMutation(activeHouseholdId);

  const activeSettleLabel =
    SETTLE_OPTIONS.find((o) => o.value === settleWith)?.label || 'Select roommate';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    createSettlementMutation.mutate(
      {
        recipientId: settleWith,
        amount: numAmount,
        notes: 'Settled via web dashboard',
      },
      {
        onSuccess: () => {
          closeModal();
          setAmount('');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Settle up</DialogTitle>
        </DialogHeader>

        {createSettlementMutation.isError && (
          <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg">
            {createSettlementMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1">
            <label className="text-[12.5px] font-medium text-[var(--muted)] block">
              Settle with
            </label>
            <Select value={settleWith} onValueChange={(val: string | null) => val && setSettleWith(val)}>
              <SelectTrigger>
                <span className="truncate">{activeSettleLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {SETTLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label htmlFor="settle-amount" className="text-[12.5px] font-medium text-[var(--muted)] block">
              Amount (MAD)
            </label>
            <Input
              id="settle-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="300.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary h-10 flex-1 rounded-lg border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-[13.5px] font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSettlementMutation.isPending}
              className="btn-primary h-10 flex-1 rounded-lg border-none bg-[var(--oak)] text-white text-[13.5px] font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors"
            >
              {createSettlementMutation.isPending ? 'Recording...' : 'Record payment'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
