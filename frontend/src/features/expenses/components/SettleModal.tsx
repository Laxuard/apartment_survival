import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  IconCoins,
  IconCash,
  IconBuildingBank,
  IconDeviceMobile,
  IconCheck,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { formatMoney } from '@/domain';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useCreateSettlementMutation } from '@/features/expenses/hooks/useExpensesQueries';
import { useHouseholdLedger } from '@/features/roommates';
import type { Roommate } from '@/features/roommates/types';
import { Button } from '@/components/ui/button';

const PAYMENT_METHODS = [
  { id: 'Cash in Hand', label: 'Cash in Hand', icon: IconCash },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: IconBuildingBank },
  { id: 'App Pay', label: 'App Pay', icon: IconDeviceMobile },
];

export const SettleModal: React.FC = () => {
  const { activeModal, selectedSettleMember, closeModal } = useUIStore();
  const isOpen = activeModal === 'settle';

  const authUser = useAuthStore((s) => s.user);
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const ledger = useHouseholdLedger();

  // Strict peers list (Guaranteed to exclude current logged-in user)
  const eligibleRoommates = ledger.peers.filter(
    (r) => !r.isCurrentUser && r.id !== authUser?.id && r.name.toLowerCase() !== authUser?.name?.toLowerCase()
  );

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [method, setMethod] = useState('Cash in Hand');
  const [validationError, setValidationError] = useState('');

  const createSettlementMutation = useCreateSettlementMutation(activeHouseholdId);

  // Sync / select default valid peer whenever modal opens or selectedSettleMember changes
  useEffect(() => {
    if (isOpen) {
      setValidationError('');
      const validPreselected =
        selectedSettleMember && eligibleRoommates.find((r) => r.id === selectedSettleMember.id);
      if (validPreselected) {
        setSelectedMemberId(validPreselected.id);
      } else {
        const firstWithDebt = eligibleRoommates.find((r) => Math.abs(r.balance) > 0.001);
        setSelectedMemberId(firstWithDebt ? firstWithDebt.id : eligibleRoommates[0]?.id ?? null);
      }
    }
  }, [isOpen, selectedSettleMember, eligibleRoommates]);

  const selectedMember: Roommate | null =
    eligibleRoommates.find((r) => r.id === selectedMemberId) ||
    eligibleRoommates[0] ||
    null;

  const fullBalance = selectedMember ? Math.abs(selectedMember.balance) : 0;
  // Peer balance > 0 means peer is owed money (creditor) -> Current user is paying peer (Outgoing)
  // Peer balance < 0 means peer owes money (debtor) -> Peer is paying current user (Received)
  const isPeerCreditor = selectedMember ? selectedMember.balance > 0.001 : false;

  const handleSelectMember = (id: string) => {
    setSelectedMemberId(id);
    setCustomAmount(null);
    setValidationError('');
  };

  const handleClose = () => {
    closeModal();
    setSelectedMemberId(null);
    setCustomAmount(null);
    setValidationError('');
  };

  const settleAmount = customAmount !== null ? customAmount : fullBalance;
  const isPartial = fullBalance > 0 && settleAmount < fullBalance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (settleAmount <= 0) {
      setValidationError('Please enter a valid payment amount.');
      return;
    }
    if (!selectedMember) {
      setValidationError('Please select a flatmate to settle with.');
      return;
    }
    if (selectedMember.id === authUser?.id || selectedMember.isCurrentUser) {
      setValidationError('Cannot record a settlement with yourself. Please select another roommate.');
      return;
    }

    createSettlementMutation.mutate(
      {
        recipientId: selectedMember.id,
        amount: settleAmount,
        notes: `Recorded payment via ${method}`,
      },
      {
        onSuccess: () => {
          confetti({
            particleCount: 60,
            spread: 55,
            origin: { y: 0.7 },
            colors: ['#7E9F74', '#D07B30', '#F4A261'],
          });
          toast.success(`Settlement recorded with ${selectedMember.name}!`, {
            description: `Payment of ${formatMoney(settleAmount, ledger.currency)} recorded (${method}).`,
          });
          handleClose();
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.response?.data?.error ||
            err.response?.data?.detail ||
            err?.message ||
            'Failed to record payment.';
          setValidationError(msg);
          toast.error(msg);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-6 space-y-4 rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl">
        <DialogHeader className="border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--positive-bg)] text-[var(--positive-text)] flex items-center justify-center font-bold">
              <IconCoins size={18} />
            </div>
            <div>
              <DialogTitle className="font-serif text-base font-bold text-[var(--text)]">
                {selectedMember
                  ? isPeerCreditor
                    ? `Record Outgoing Payment to ${selectedMember.name}`
                    : `Record Received Payment from ${selectedMember.name}`
                  : 'Record Settlement Payment'}
              </DialogTitle>
              <p className="text-[11px] text-[var(--muted)]">Settle shared living ledger tab</p>
            </div>
          </div>
        </DialogHeader>

        {validationError && (
          <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-start gap-2.5 text-xs animate-fade-in shadow-xs">
            <IconAlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1 min-w-0">
              <div className="font-semibold text-red-200">Unable to record settlement</div>
              <div className="text-red-300/90 text-[11.5px] leading-relaxed break-words">{validationError}</div>
            </div>
          </div>
        )}

        {eligibleRoommates.length === 0 ? (
          <div className="text-center py-6 space-y-2">
            <p className="text-xs text-[var(--muted)]">No other flatmates found in this household to settle with.</p>
            <Button size="sm" variant="outline" onClick={handleClose} className="rounded-xl text-xs">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-1">
            {/* Flatmate Selection Pills (shown if multiple peers) */}
            {eligibleRoommates.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--muted)] block">
                  Select Flatmate
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {eligibleRoommates.map((rm) => {
                    const isSelected = selectedMember?.id === rm.id;
                    const rmOwesYou = rm.balance < -0.001;
                    return (
                      <button
                        key={rm.id}
                        type="button"
                        onClick={() => handleSelectMember(rm.id)}
                        className={`btn-spring px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 border transition-all cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-[var(--oak)] text-white border-[var(--oak)] font-bold shadow-xs'
                            : 'bg-[var(--canvas)] text-[var(--text)] border-[var(--border)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[var(--card)] text-[var(--muted)]'
                          }`}
                        >
                          {rm.avatarInitial}
                        </span>
                        <span>{rm.name}</span>
                        <span
                          className={`mono text-[10.5px] font-bold ${
                            isSelected
                              ? 'text-white'
                              : rmOwesYou
                              ? 'text-[var(--oak)]'
                              : 'text-[var(--sage)]'
                          }`}
                        >
                          {rmOwesYou ? `Owes ${formatMoney(Math.abs(rm.balance), ledger.currency)}` : `Owed ${formatMoney(rm.balance, ledger.currency)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Amount Paid Input & Quick Preset Chips */}
            <div className="p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11.5px] font-semibold text-[var(--muted)]">
                  {isPeerCreditor
                    ? `Amount Paid to ${selectedMember?.name || 'Flatmate'}:`
                    : `Amount Received from ${selectedMember?.name || 'Flatmate'}:`}
                </span>
                <span className="text-[11px] text-[var(--muted)]">
                  Total Tab:{' '}
                  <strong className="text-[var(--text)] font-mono">
                    {formatMoney(fullBalance, ledger.currency)}
                  </strong>
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={settleAmount || ''}
                  onChange={(e) => setCustomAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[var(--card)] text-[var(--text)] text-xl font-bold rounded-xl pl-3.5 pr-14 py-2.5 border border-[var(--border-strong)] focus:outline-none focus:border-[var(--oak)] font-mono"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] pointer-events-none">
                  {ledger.currency}
                </span>
              </div>

              {/* Quick 100% Full / 50% Half Chips */}
              {fullBalance > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setCustomAmount(fullBalance)}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      settleAmount === fullBalance
                        ? 'bg-[var(--oak)] text-white border-[var(--oak)] font-bold'
                        : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                    }`}
                  >
                    100% Full ({formatMoney(fullBalance, ledger.currency)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomAmount(parseFloat((fullBalance / 2).toFixed(2)))}
                    className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      settleAmount === parseFloat((fullBalance / 2).toFixed(2))
                        ? 'bg-[var(--oak)] text-white border-[var(--oak)] font-bold'
                        : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                    }`}
                  >
                    50% Half ({formatMoney(fullBalance / 2, ledger.currency)})
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--muted)] block">
                Payment Method Used
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = method === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setMethod(pm.id)}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--oak-tint)]/60 border-[var(--oak)] text-[var(--oak)] font-bold shadow-2xs'
                          : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-[11px]">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--border)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={createSettlementMutation.isPending}
                className="text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={createSettlementMutation.isPending}
                className="text-xs rounded-xl flex items-center gap-1.5 shadow-sm bg-[var(--oak)] hover:bg-[var(--oak)]/90 text-white cursor-pointer"
              >
                <IconCheck size={14} />
                <span>
                  {createSettlementMutation.isPending
                    ? 'Recording...'
                    : isPartial
                    ? `Record Partial Payment (${formatMoney(settleAmount, ledger.currency)})`
                    : 'Record as Settled'}
                </span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
