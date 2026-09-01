import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  IconBolt,
  IconHome2,
  IconReceipt2,
  IconTools,
  IconCalendarEvent,
  IconUser,
  IconPlus,
  IconAlertTriangle,
} from '@tabler/icons-react';

import { useUIStore } from '@/stores/useUIStore';
import { useActiveHousehold } from '@/features/households';
import { useRoommatesQuery } from '@/features/roommates';
import { useAuthStore } from '@/stores/useAuthStore';
import { useCreateRecurringBillMutation } from '../hooks/useBillsQueries';
import type { RecurringBillCategory } from '../types';

const CATEGORIES: Array<{
  value: RecurringBillCategory;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  defaultIconName: string;
}> = [
  { value: 'UTILITIES', label: 'Utilities & Wi-Fi', icon: IconBolt, defaultIconName: 'bolt' },
  { value: 'RENT', label: 'Apartment Rent', icon: IconHome2, defaultIconName: 'home' },
  { value: 'MAINTENANCE', label: 'Maintenance & Repairs', icon: IconTools, defaultIconName: 'tools' },
  { value: 'OTHER', label: 'Other Recurring', icon: IconReceipt2, defaultIconName: 'other' },
];

const QUICK_DAYS = [1, 5, 10, 15, 20, 25, 28];

export const CreateBillModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'bill';

  const { activeHouseholdId, activeCurrency: currency } = useActiveHousehold();
  const { user } = useAuthStore();
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);
  const createBillMutation = useCreateRecurringBillMutation(activeHouseholdId);

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<RecurringBillCategory>('UTILITIES');
  const [dueDayOfMonth, setDueDayOfMonth] = useState<number>(5);
  const [responsiblePayerId, setResponsiblePayerId] = useState<string>('');
  const [error, setError] = useState('');

  // Prepare roommate list with current user fallback
  const payerOptions = useMemo(() => {
    if (roommates.length > 0) {
      return roommates.map((r) => ({
        id: r.id,
        name: r.name,
        isCurrentUser: r.isCurrentUser ?? (r.id === user?.id),
      }));
    }
    if (user?.id) {
      return [
        {
          id: user.id,
          name: user.name || 'You',
          isCurrentUser: true,
        },
      ];
    }
    return [];
  }, [roommates, user]);

  // Set default payer when modal opens
  const effectivePayerId = responsiblePayerId || payerOptions[0]?.id || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Please provide a title for the recurring bill.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive bill amount.');
      return;
    }

    if (!dueDayOfMonth || dueDayOfMonth < 1 || dueDayOfMonth > 31) {
      setError('Due day of month must be between 1 and 31.');
      return;
    }

    if (!effectivePayerId) {
      setError('Please select a primary roommate responsible for paying.');
      return;
    }

    const selectedCatMeta = CATEGORIES.find((c) => c.value === category);

    try {
      await createBillMutation.mutateAsync({
        title: trimmedTitle,
        amount: numAmount,
        category,
        dueDayOfMonth,
        responsiblePayerId: effectivePayerId,
        splitStrategy: 'EQUAL',
        iconName: selectedCatMeta?.defaultIconName || 'home',
      });

      toast.success(`Recurring bill "${trimmedTitle}" set up!`, {
        description: `Due on day ${dueDayOfMonth} of every month · Equal split`,
      });

      // Reset form & close
      setTitle('');
      setAmount('');
      setCategory('UTILITIES');
      setDueDayOfMonth(5);
      setResponsiblePayerId('');
      closeModal();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to create recurring bill. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className="max-w-md w-full p-0 bg-[var(--card)] border border-[var(--border-strong)] shadow-2xl rounded-2xl overflow-hidden"
      >
        <DialogHeader className="p-5 pb-4 border-b border-[var(--border)] bg-[var(--canvas)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--oak-tint)]/60 text-[var(--oak)] flex items-center justify-center border border-[var(--oak)]/30 shrink-0">
              <IconCalendarEvent size={20} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-[var(--text)]">
                Set Up Recurring Bill
              </DialogTitle>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Expense template on schedule · Automatically split when marked paid
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-start gap-2.5 text-xs animate-fade-in shadow-xs">
              <IconAlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="font-semibold text-red-200">Unable to save recurring bill</div>
                <div className="text-red-300/90 text-[11.5px] leading-relaxed break-words">{error}</div>
              </div>
            </div>
          )}


          {/* 1. Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
              <span>Bill Title</span>
              <span className="text-[11px] text-[var(--muted)] font-normal">e.g. Orange Fiber, Rent</span>
            </label>
            <Input
              type="text"
              placeholder="e.g. Orange 100M Fiber"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[var(--canvas)] border-[var(--border)] text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-[var(--oak)]"
              autoFocus
              required
            />
          </div>

          {/* 2. Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
              <span>Expected Amount</span>
              <span className="text-[11px] text-[var(--muted)] font-normal">{currency}</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--muted)] font-medium">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="350.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-14 font-mono font-bold text-sm bg-[var(--canvas)] border-[var(--border)] rounded-xl focus-visible:ring-1 focus-visible:ring-[var(--oak)]"
                required
              />
            </div>
          </div>

          {/* 3. Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.value;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--oak)] bg-[var(--oak-tint)]/30 text-[var(--text)] font-semibold shadow-2xs'
                        : 'border-[var(--border)] bg-[var(--canvas)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[var(--oak)] text-white'
                          : 'bg-[var(--card)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      <Icon size={14} />
                    </div>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Due Day of Month */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[var(--text)]">
                Due Day of Month
              </label>
              <span className="text-xs font-mono font-bold text-[var(--oak)]">
                Day {dueDayOfMonth} of each month
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => setDueDayOfMonth(day)}
                  className={`px-2.5 py-1 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
                    dueDayOfMonth === day
                      ? 'bg-[var(--oak)] text-white border-[var(--oak)] font-bold shadow-2xs'
                      : 'bg-[var(--canvas)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  {day}th
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-[11px] text-[var(--muted)]">Custom:</span>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDayOfMonth}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (!isNaN(v) && v >= 1 && v <= 31) setDueDayOfMonth(v);
                  }}
                  className="w-14 h-7 text-xs font-mono text-center p-0 rounded-lg bg-[var(--canvas)] border-[var(--border)]"
                />
              </div>
            </div>
          </div>

          {/* 5. Primary Payer */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
              <span>Primary Payer</span>
              <span className="text-[11px] text-[var(--muted)] font-normal">Who physically pays</span>
            </label>
            <Select
              value={effectivePayerId}
              onValueChange={(val) => setResponsiblePayerId(val ?? '')}
            >

              <SelectTrigger className="w-full bg-[var(--canvas)] border-[var(--border)] rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <IconUser size={14} className="text-[var(--muted)] shrink-0" />
                  <span>
                    {payerOptions.find((p) => p.id === effectivePayerId)?.name || 'Select roommate'}
                    {payerOptions.find((p) => p.id === effectivePayerId)?.isCurrentUser ? ' (You)' : ''}
                  </span>
                </div>
              </SelectTrigger>
              <SelectContent className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg">
                {payerOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs py-2">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.isCurrentUser && (
                        <span className="text-[10px] uppercase font-bold text-[var(--oak)] bg-[var(--oak-tint)]/40 px-1.5 py-0.5 rounded">
                          You
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[11px] text-[var(--muted)]">
              When paid, this bill is automatically split equally among all roommates.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={createBillMutation.isPending}
              className="text-xs rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createBillMutation.isPending}
              className="text-xs rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <IconPlus size={14} />
              <span>{createBillMutation.isPending ? 'Saving...' : 'Set Up Bill Template'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

