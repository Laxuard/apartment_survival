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
import { useCreateExpenseMutation } from '@/features/expenses/hooks/useExpensesQueries';

const CATEGORY_OPTIONS = [
  { value: 'GROCERIES', label: 'Groceries' },
  { value: 'UTILITIES', label: 'Utilities' },
  { value: 'RENT', label: 'Rent' },
  { value: 'HOUSEHOLD', label: 'Household' },
  { value: 'OTHER', label: 'Other' },
] as const;

const SPLIT_OPTIONS = [
  { value: 'EQUAL', label: 'Equal split' },
  { value: 'EXACT', label: 'Custom split' },
  { value: 'PERCENTAGE', label: 'Percentage split' },
] as const;

export const ExpenseModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'expense';
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('GROCERIES');
  const [splitMethod, setSplitMethod] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE'>('EQUAL');

  const createExpenseMutation = useCreateExpenseMutation(activeHouseholdId);

  const activeCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === category)?.label || 'Groceries';
  const activeSplitLabel =
    SPLIT_OPTIONS.find((s) => s.value === splitMethod)?.label || 'Equal split';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !title.trim()) return;

    createExpenseMutation.mutate(
      {
        title: title.trim(),
        amount: numAmount,
        category,
        splitType: splitMethod,
        expenseDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          closeModal();
          setAmount('');
          setTitle('');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Log expense</DialogTitle>
        </DialogHeader>

        {createExpenseMutation.isError && (
          <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg">
            {createExpenseMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div className="space-y-1">
            <label htmlFor="exp-amount" className="text-[12.5px] font-medium text-[var(--muted)] block">
              Amount (MAD)
            </label>
            <Input
              id="exp-amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="exp-title" className="text-[12.5px] font-medium text-[var(--muted)] block">
              Description
            </label>
            <Input
              id="exp-title"
              type="text"
              placeholder="Weekly groceries"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[12.5px] font-medium text-[var(--muted)] block">
              Category
            </label>
            <Select value={category} onValueChange={(val: string | null) => val && setCategory(val)}>
              <SelectTrigger>
                <span className="truncate">{activeCategoryLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[12.5px] font-medium text-[var(--muted)] block">
              Split method
            </label>
            <Select value={splitMethod} onValueChange={(val: string | null) => val && setSplitMethod(val as any)}>
              <SelectTrigger>
                <span className="truncate">{activeSplitLabel}</span>
              </SelectTrigger>
              <SelectContent>
                {SPLIT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              disabled={createExpenseMutation.isPending}
              className="btn-primary h-10 flex-1 rounded-lg border-none bg-[var(--oak)] text-white text-[13.5px] font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors"
            >
              {createExpenseMutation.isPending ? 'Logging...' : 'Log expense'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
