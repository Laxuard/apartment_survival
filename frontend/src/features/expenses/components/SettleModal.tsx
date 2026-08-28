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
  IconArrowsExchange,
  IconCash,
  IconBuildingBank,
  IconDeviceMobile,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useCreateSettlementMutation } from '@/features/expenses/hooks/useExpensesQueries';
import { useRoommatesQuery } from '@/features/roommates';
import type { Roommate } from '@/features/roommates/types';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash In Hand', icon: <IconCash size={15} /> },
  { id: 'BANK', label: 'Bank Transfer', icon: <IconBuildingBank size={15} /> },
  { id: 'APP', label: 'Instant Pay', icon: <IconDeviceMobile size={15} /> },
];

interface SettleModalFormProps {
  roommates: Roommate[];
  currency: string;
  activeHouseholdId: string | null;
  onClose: () => void;
}

const SettleModalForm: React.FC<SettleModalFormProps> = ({
  roommates,
  currency,
  activeHouseholdId,
  onClose,
}) => {
  const initialOwing = roommates.find((r) => r.balance > 0) || roommates[0];
  const [settleWith, setSettleWith] = useState<string>(initialOwing?.id || '');
  const [amount, setAmount] = useState(
    initialOwing && initialOwing.balance > 0 ? initialOwing.balance.toFixed(2) : '0.00'
  );
  const [method, setMethod] = useState('CASH');
  const [validationError, setValidationError] = useState('');

  const createSettlementMutation = useCreateSettlementMutation(activeHouseholdId);
  const selectedDebtor = roommates.find((r) => r.id === settleWith) || roommates[0];

  const handleSelectDebtor = (id: string, debtAmount: number) => {
    setSettleWith(id);
    setAmount(debtAmount > 0 ? debtAmount.toFixed(2) : '0.00');
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      setValidationError('Please enter a valid settlement amount.');
      return;
    }
    if (!settleWith) {
      setValidationError('Please select a roommate to settle with.');
      return;
    }
    setValidationError('');

    createSettlementMutation.mutate(
      {
        recipientId: settleWith,
        amount: numAmount,
        notes: `Settled via ${method}`,
      },
      {
        onSuccess: () => {
          onClose();
          setAmount('');
          setValidationError('');
        },
      }
    );
  };

  return (
    <>
      {validationError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] border border-[var(--negative-text)]/30 p-2.5 rounded-xl animate-fade-in mt-2">
          {validationError}
        </div>
      )}

      {createSettlementMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg mt-2">
          {createSettlementMutation.error?.message || 'Settlement failed.'}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
        {/* Select Debtor Cards */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--muted)] block">
            Who is settling with you?
          </label>
          {roommates.length === 0 ? (
            <div className="p-3 text-xs text-[var(--muted)] text-center bg-[var(--canvas)] rounded-xl">
              No roommates found in this household.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {roommates.map((rm) => (
                <button
                  key={rm.id}
                  type="button"
                  onClick={() => handleSelectDebtor(rm.id, rm.balance)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    settleWith === rm.id
                      ? 'border-[var(--oak)] bg-[var(--oak-tint)]/40 ring-1 ring-[var(--oak)]'
                      : 'border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`avatar-badge ${rm.avatarColor} text-xs w-6 h-6 shrink-0`}>
                      {rm.avatarInitial}
                    </span>
                    <div className="min-w-0 truncate">
                      <div className="text-xs font-bold text-[var(--text)] truncate">{rm.name}</div>
                      <div className="text-[10px] text-[var(--muted)] truncate">
                        {rm.balance > 0 ? 'Owes you' : rm.balance < 0 ? 'You owe' : 'Settled'}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`mono text-xs font-bold shrink-0 ml-1 ${
                      rm.balance >= 0 ? 'text-[var(--sage)]' : 'text-[var(--oak)]'
                    }`}
                  >
                    {rm.balance >= 0 ? '+' : ''}
                    {rm.balance.toFixed(0)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount Input & Preset Chips */}
        <div className="bg-[var(--canvas)] p-3.5 rounded-2xl border border-[var(--border)] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <label htmlFor="settle-amount" className="font-semibold text-[var(--muted)] uppercase tracking-wider">
              Settlement Amount
            </label>
            {selectedDebtor && selectedDebtor.balance > 0 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAmount(selectedDebtor.balance.toFixed(2))}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border-strong)] hover:bg-[var(--sage-tint)] text-[var(--text)] cursor-pointer"
                >
                  Full (+{selectedDebtor.balance.toFixed(0)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmount((selectedDebtor.balance / 2).toFixed(2))}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border-strong)] hover:bg-[var(--sage-tint)] text-[var(--text)] cursor-pointer"
                >
                  Half (50%)
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="mono font-bold text-lg text-[var(--muted)]">{currency}</span>
            <Input
              id="settle-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-transparent border-none text-2xl font-bold mono focus-visible:ring-0 p-0 h-9 text-[var(--text)]"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--muted)] block">
            Payment Channel
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  method === m.id
                    ? 'bg-[var(--sage)] text-white border-[var(--sage)] font-semibold shadow-sm'
                    : 'bg-[var(--canvas)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--sage-tint)]'
                }`}
              >
                {m.icon}
                <span className="truncate">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary h-9 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-xs font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createSettlementMutation.isPending || !settleWith}
            className="btn-tactile h-9 px-5 rounded-xl border-none bg-[var(--sage)] text-white text-xs font-semibold hover:opacity-90 cursor-pointer transition-colors shadow-sm"
          >
            {createSettlementMutation.isPending ? 'Processing...' : 'Confirm Settlement'}
          </button>
        </DialogFooter>
      </form>
    </>
  );
};

export const SettleModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const isOpen = activeModal === 'settle';
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveCurrency } = useHouseholdStore();
  const currency = getActiveCurrency();

  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[440px] p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
        <DialogHeader className="border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--sage-tint)] text-[var(--sage)] flex items-center justify-center font-bold text-sm">
              <IconArrowsExchange size={18} />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-semibold text-[var(--text)]">
                Record Debt Settlement
              </DialogTitle>
              <p className="text-xs text-[var(--muted)]">Log cash or bank payments between flatmates</p>
            </div>
          </div>
        </DialogHeader>

        {isOpen && (
          <SettleModalForm
            key="settle-form"
            roommates={roommates}
            currency={currency}
            activeHouseholdId={activeHouseholdId}
            onClose={closeModal}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
