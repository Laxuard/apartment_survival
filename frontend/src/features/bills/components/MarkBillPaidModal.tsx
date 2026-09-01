import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  IconCheck,
  IconBolt,
  IconHome2,
  IconTools,
  IconScale,
  IconUser,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useActiveHousehold } from '@/features/households';
import { useRoommatesQuery } from '@/features/roommates';
import { useAuthStore } from '@/stores/useAuthStore';
import { formatMoney, calculateEqualSplit } from '@/domain';
import { useBillsSummary } from '../hooks/useBillsSummary';
import { getCurrentMonthName, getCurrentPeriod } from '../utils/billsCalculations';

export const MarkBillPaidModal: React.FC = () => {
  const { activeModal, selectedBillForPayment, closeModal } = useUIStore();
  const isOpen = activeModal === 'markBillPaid' && !!selectedBillForPayment;

  const { activeHouseholdId, activeCurrency: currency } = useActiveHousehold();
  const { user } = useAuthStore();
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);
  const { payBill, isPayingBill } = useBillsSummary();

  const [actualAmount, setActualAmount] = useState<string>('');
  const [payerId, setPayerId] = useState<string>('');
  const [expenseDate, setExpenseDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Sync state when selected bill opens
  useEffect(() => {
    if (selectedBillForPayment) {
      setActualAmount(selectedBillForPayment.amount ? selectedBillForPayment.amount.toString() : '');
      setPayerId(selectedBillForPayment.responsiblePayerId || user?.id || '');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [selectedBillForPayment, user?.id]);

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

  const activePayer = payerOptions.find((p) => p.id === payerId) || payerOptions[0];
  const activePayerName = activePayer?.isCurrentUser ? 'You' : activePayer?.name || 'Primary Payer';

  const currentMonthName = getCurrentMonthName();
  const currentPeriod = getCurrentPeriod();

  const numAmount = parseFloat(actualAmount) || 0;
  const memberCount = Math.max(1, roommates.length || 1);
  const perPersonAmount = calculateEqualSplit(numAmount, memberCount);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPayment) return;
    setError('');

    if (!numAmount || numAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    if (!payerId) {
      setError('Please choose the roommate who paid this bill.');
      return;
    }

    try {
      await payBill(selectedBillForPayment, numAmount, payerId);

      toast.success(`Recorded payment for ${selectedBillForPayment.title}!`, {
        description: `Logged ${formatMoney(numAmount, currency)} in ledger · Split equally (${formatMoney(perPersonAmount, currency)}/person).`,
      });

      closeModal();
    } catch (err: any) {
      console.error('Error marking bill paid:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err?.message ||
        'Failed to record bill payment. Please check your connection.';
      setError(msg);
    }
  };

  if (!selectedBillForPayment) return null;

  const isRent = selectedBillForPayment.category === 'RENT' || selectedBillForPayment.iconName === 'home';
  const Icon = isRent ? IconHome2 : selectedBillForPayment.category === 'MAINTENANCE' ? IconTools : IconBolt;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-md w-full p-0 bg-[var(--card)] border border-[var(--border-strong)] shadow-2xl rounded-2xl overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-5 pb-4 border-b border-[var(--border)] bg-[var(--canvas)]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center border border-[var(--oak)]/30 shrink-0">
              <Icon size={22} />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-[var(--text)]">
                Mark Bill as Paid
              </DialogTitle>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Cycle: <span className="font-semibold text-[var(--text)]">{currentMonthName} ({currentPeriod})</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="p-5 space-y-4">
          {/* Prominent High-Contrast Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-start gap-2.5 text-xs animate-fade-in shadow-xs">
              <IconAlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="font-semibold text-red-200">Unable to record payment</div>
                <div className="text-red-300/90 text-[11.5px] leading-relaxed break-words">{error}</div>
              </div>
            </div>
          )}

          {/* Banner Confirmation Statement */}
          <div className="p-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-1 text-xs">
            <div className="font-medium text-[var(--text)]">
              Confirm <span className="font-bold text-[var(--oak)]">{activePayerName}</span> paid for{' '}
              <span className="font-semibold">{currentMonthName} {selectedBillForPayment.title}</span>?
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              This will automatically log an expense and update everyone&apos;s balances in the ledger.
            </p>
          </div>

          {/* 1. Actual Amount Paid (allows quick adjustment for fluctuating utilities) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
              <span>Amount Paid this Month</span>
              <span className="text-[11px] text-[var(--muted)] font-normal">
                {numAmount !== selectedBillForPayment.amount ? '(Adjusted for this cycle)' : '(Template default)'}
              </span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[var(--muted)] font-medium">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="pl-14 font-mono font-bold text-base bg-[var(--canvas)] border-[var(--border)] rounded-xl focus-visible:ring-1 focus-visible:ring-[var(--oak)]"
                autoFocus
                required
              />
            </div>
          </div>

          {/* 2. Payer Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center justify-between">
              <span>Paid By</span>
              <span className="text-[11px] text-[var(--muted)] font-normal">Who sent the money</span>
            </label>
            <Select value={payerId} onValueChange={(val) => setPayerId(val ?? '')}>
              <SelectTrigger className="w-full bg-[var(--canvas)] border-[var(--border)] rounded-xl text-xs">
                <div className="flex items-center gap-2 truncate">
                  <IconUser size={14} className="text-[var(--muted)] shrink-0" />
                  <span>
                    {activePayer?.name || 'Select roommate'}
                    {activePayer?.isCurrentUser ? ' (You)' : ''}
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
          </div>

          {/* 3. Payment Date with Shadcn Popover DatePicker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)]">
              Payment Date
            </label>
            <DatePicker
              value={expenseDate}
              onChange={setExpenseDate}
            />
          </div>

          {/* Breakdown Preview */}
          <div className="p-3 rounded-xl bg-[var(--oak-tint)]/20 border border-[var(--oak)]/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <IconScale size={15} className="text-[var(--oak)] shrink-0" />
              <span>Equal Split ({memberCount} flatmates)</span>
            </div>
            <div className="font-mono font-bold text-[var(--text)]">
              {formatMoney(perPersonAmount, currency)} / person
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--border)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={closeModal}
              disabled={isPayingBill}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPayingBill}
              className="text-xs rounded-xl flex items-center gap-1.5 shadow-sm bg-[var(--oak)] hover:bg-[var(--oak)]/90 text-white cursor-pointer"
            >
              <IconCheck size={14} />
              <span>{isPayingBill ? 'Updating Ledger...' : 'Confirm & Mark Paid'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
