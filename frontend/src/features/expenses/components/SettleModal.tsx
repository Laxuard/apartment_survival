import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  IconCoins,
  IconCash,
  IconBuildingBank,
  IconDeviceMobile,
  IconCheck,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useCreateSettlementMutation } from '@/features/expenses/hooks/useExpensesQueries';
import { useHouseholdLedger } from '@/features/roommates';
import type { Roommate } from '@/features/roommates/types';

const PAYMENT_METHODS = [
  { id: 'Cash in Hand', label: 'Cash in Hand', icon: IconCash },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: IconBuildingBank },
  { id: 'App Pay', label: 'App Pay', icon: IconDeviceMobile },
];

export const SettleModal: React.FC = () => {
  const { activeModal, selectedSettleMember, closeModal } = useUIStore();
  const isOpen = activeModal === 'settle';

  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const ledger = useHouseholdLedger();
  const eligibleRoommates = ledger.peers;

  const defaultMember =
    selectedSettleMember ||
    eligibleRoommates.find((r) => r.balance !== 0) ||
    eligibleRoommates[0] ||
    null;

  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<number | null>(null);
  const [method, setMethod] = useState('Cash in Hand');
  const [validationError, setValidationError] = useState('');

  const createSettlementMutation = useCreateSettlementMutation(activeHouseholdId);

  const activeSelectedMemberId =
    selectedMemberId ??
    selectedSettleMember?.id ??
    eligibleRoommates.find((r) => r.balance !== 0)?.id ??
    eligibleRoommates[0]?.id ??
    '';

  const selectedMember: Roommate | null =
    eligibleRoommates.find((r) => r.id === activeSelectedMemberId) || defaultMember;

  const fullBalance = selectedMember ? Math.abs(selectedMember.balance) : 0;
  const isDebtorPayingYou = selectedMember ? selectedMember.balance >= 0 : true;

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
    if (settleAmount <= 0) {
      setValidationError('Please enter a valid payment amount.');
      return;
    }
    if (!selectedMember) {
      setValidationError('Please select a flatmate to settle with.');
      return;
    }
    setValidationError('');

    confetti({
      particleCount: 65,
      spread: 55,
      origin: { y: 0.7 },
      colors: ['#C1793D', '#6B7A5E', '#7CC199'],
    });

    toast.success(
      isPartial
        ? `Recorded partial payment of ${settleAmount.toFixed(2)} ${ledger.currency}`
        : `Settled ${settleAmount.toFixed(2)} ${ledger.currency} with ${selectedMember.name}`,
      {
        description: `Logged via ${method} offline. Ledger updated.`,
      }
    );

    createSettlementMutation.mutate(
      {
        recipientId: selectedMember.id,
        amount: settleAmount,
        notes: `Recorded payment via ${method}`,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-6 space-y-4 rounded-3xl bg-[var(--card)] border border-[var(--border)]">
        <DialogHeader className="border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--positive-bg)] text-[var(--positive-text)] flex items-center justify-center font-bold">
              <IconCoins size={18} />
            </div>
            <div>
              <DialogTitle className="font-serif text-base font-bold text-[var(--text)]">
                {selectedMember
                  ? isDebtorPayingYou
                    ? 'Record Received Payment'
                    : 'Record Outgoing Payment'
                  : 'Record Payment'}
              </DialogTitle>
              <p className="text-[11px] text-[var(--muted)]">Settle shared living ledger</p>
            </div>
          </div>
        </DialogHeader>

        {validationError && (
          <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] border border-[var(--negative-text)]/30 p-2.5 rounded-xl animate-fade-in mt-1">
            {validationError}
          </div>
        )}

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
                  const owes = rm.balance > 0;
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
                            : owes
                            ? 'text-[var(--positive-text)]'
                            : 'text-[var(--negative-text)]'
                        }`}
                      >
                        {rm.balance >= 0 ? '+' : ''}
                        {rm.balance.toFixed(0)}
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
                {isDebtorPayingYou
                  ? `Amount Paid by ${selectedMember?.name || 'Flatmate'}:`
                  : `Amount Paid to ${selectedMember?.name || 'Flatmate'}:`}
              </span>
              <span className="text-[11px] text-[var(--muted)]">
                Total Tab:{' '}
                <strong className="text-[var(--text)] font-mono">
                  {fullBalance.toFixed(2)} {ledger.currency}
                </strong>
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                step="1"
                min="1"
                value={settleAmount || ''}
                onChange={(e) => setCustomAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-[var(--card)] text-[var(--text)] text-xl font-bold rounded-xl px-3.5 py-2.5 border border-[var(--border-strong)] focus:outline-none focus:border-[var(--oak)] font-mono"
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
                      ? 'bg-[var(--oak)] text-white border-[var(--oak)] shadow-xs'
                      : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--border)]'
                  }`}
                >
                  100% Full ({fullBalance.toFixed(0)} {ledger.currency})
                </button>

                <button
                  type="button"
                  onClick={() => setCustomAmount(Math.round(fullBalance / 2))}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    settleAmount === Math.round(fullBalance / 2)
                      ? 'bg-[var(--oak)] text-white border-[var(--oak)] shadow-xs'
                      : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--border)]'
                  }`}
                >
                  50% Half ({Math.round(fullBalance / 2)} {ledger.currency})
                </button>
              </div>
            )}

            {isPartial && (
              <div className="text-[11px] text-[var(--warn-text)] font-medium pt-0.5">
                Partial payment: {(fullBalance - settleAmount).toFixed(2)} {ledger.currency} will remain on tab.
              </div>
            )}
          </div>

          {/* Payment Method Used */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text)] block">
              Payment Method Used
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/20 shadow-xs'
                        : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <Icon size={18} className={isSelected ? 'text-[var(--oak)]' : 'text-[var(--muted)]'} />
                    <span className="text-[11px] font-bold text-[var(--text)]">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Actions */}
          <DialogFooter className="pt-3 gap-2 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary h-9 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-xs font-medium hover:bg-[var(--canvas)] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createSettlementMutation.isPending || settleAmount <= 0}
              className="btn-tactile h-9 px-5 rounded-xl border-none bg-[var(--oak)] text-white text-xs font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <IconCheck size={15} />
              <span>{isPartial ? 'Record Partial Payment' : 'Record as Settled'}</span>
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
