import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  IconPlus,
  IconShoppingCart,
  IconBolt,
  IconHome2,
  IconCup,
  IconReceipt2,
  IconUsers,
  IconScale,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useCreateExpenseMutation } from '@/features/expenses/hooks/useExpensesQueries';
import { useRoommatesQuery } from '@/features/roommates';

const CATEGORIES = [
  { value: 'GROCERIES', label: 'Groceries', icon: <IconShoppingCart size={15} /> },
  { value: 'UTILITIES', label: 'Utilities', icon: <IconBolt size={15} /> },
  { value: 'RENT', label: 'Rent', icon: <IconHome2 size={15} /> },
  { value: 'FOOD', label: 'Food & Dining', icon: <IconCup size={15} /> },
  { value: 'HOUSEHOLD', label: 'Household', icon: <IconHome2 size={15} /> },
  { value: 'OTHER', label: 'Other', icon: <IconReceipt2 size={15} /> },
];

export const ExpenseModal: React.FC = () => {
  const navigate = useNavigate();
  const { activeModal, expensePrefill, closeModal } = useUIStore();
  const isOpen = activeModal === 'expense';
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveHousehold, getActiveCurrency } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();
  const currency = getActiveCurrency();

  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);
  const memberCount = Math.max(1, roommates.length || activeHousehold?.memberCount || 1);

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('GROCERIES');
  const [splitMethod, setSplitMethod] = useState<'EQUAL' | 'EXACT' | 'PERCENTAGE'>('EQUAL');
  const [validationError, setValidationError] = useState('');

  // Keep state in sync with prefill only on open change
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen && expensePrefill) {
      setAmount(expensePrefill.amount ? expensePrefill.amount.toString() : '');
      setTitle(expensePrefill.title || '');
      setCategory(expensePrefill.category || 'GROCERIES');
      setValidationError('');
    } else if (!isOpen) {
      setAmount('');
      setTitle('');
      setCategory('GROCERIES');
      setSplitMethod('EQUAL');
      setValidationError('');
    }
  }

  const createExpenseMutation = useCreateExpenseMutation(activeHouseholdId);

  const numAmount = parseFloat(amount) || 0;
  const perPersonShare = numAmount > 0 ? numAmount / memberCount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setValidationError('Please enter a valid expense amount.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Please enter a description for the expense.');
      return;
    }
    setValidationError('');

    const expenseTitle = title.trim();
    const expenseCategory = category;

    createExpenseMutation.mutate(
      {
        title: expenseTitle,
        amount: numAmount,
        category: expenseCategory,
        splitType: splitMethod,
        expenseDate: new Date().toISOString(),
      },
      {
        onSuccess: () => {
          closeModal();
          setAmount('');
          setTitle('');

          if (expenseCategory === 'GROCERIES') {
            toast.success(`Logged grocery expense: ${expenseTitle}`, {
              description: `Total: ${numAmount.toFixed(2)} ${currency} (${perPersonShare.toFixed(2)} / flatmate)`,
              action: {
                label: 'Restock in Pantry 🛒',
                onClick: () => navigate('/pantry'),
              },
            });
          } else {
            toast.success(`Logged expense: ${expenseTitle}`, {
              description: `Total: ${numAmount.toFixed(2)} ${currency} (${perPersonShare.toFixed(2)} / flatmate)`,
            });
          }
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-[460px] p-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold text-sm">
              <IconPlus size={18} />
            </div>
            <div>
              <DialogTitle className="font-serif text-lg font-semibold text-[var(--text)]">
                Log Household Expense
              </DialogTitle>
              <p className="text-xs text-[var(--muted)]">Record a shared purchase to update the ledger</p>
            </div>
          </div>
        </DialogHeader>

        {validationError && (
          <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] border border-[var(--negative-text)]/30 p-2.5 rounded-xl animate-fade-in mt-1">
            {validationError}
          </div>
        )}

        {createExpenseMutation.isError && (
          <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-xl mt-1">
            {createExpenseMutation.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4 pt-2">
          {/* Amount Large Input */}
          <div className="bg-[var(--canvas)] p-3.5 rounded-2xl border border-[var(--border)] space-y-1">
            <label htmlFor="exp-amount" className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider block">
              Expense Total Amount
            </label>
            <div className="flex items-center gap-2">
              <span className="mono font-bold text-lg text-[var(--muted)]">{currency}</span>
              <Input
                id="exp-amount"
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

          {/* Description */}
          <div className="space-y-1">
            <label htmlFor="exp-title" className="text-xs font-medium text-[var(--muted)] block">
              Description / Memo
            </label>
            <Input
              id="exp-title"
              type="text"
              placeholder="e.g., Weekly Costco trip, Internet bill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="bg-[var(--canvas)] border-[var(--border)] text-xs h-9 rounded-lg"
            />
          </div>

          {/* Category Chips */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted)] block">
              Select Category
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    category === cat.value
                      ? 'bg-[var(--oak)] text-white border-[var(--oak)] shadow-sm font-semibold'
                      : 'bg-[var(--canvas)] text-[var(--text)] border-[var(--border)] hover:bg-[var(--sage-tint)]'
                  }`}
                >
                  {cat.icon}
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Split Mode Selector & Live Shares Preview */}
          <div className="space-y-2 pt-1 border-t border-[var(--border)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-[var(--muted)] flex items-center gap-1">
                <IconScale size={14} className="text-[var(--sage)]" />
                Split Strategy
              </label>
              <span className="text-[11px] text-[var(--muted)]">{memberCount} flatmates included</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(['EQUAL', 'EXACT', 'PERCENTAGE'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setSplitMethod(method)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                    splitMethod === method
                      ? 'bg-[var(--canvas)] border-[var(--oak)] text-[var(--text)] ring-1 ring-[var(--oak)] font-semibold'
                      : 'bg-[var(--card)] text-[var(--muted)] border-[var(--border)] hover:text-[var(--text)]'
                  }`}
                >
                  {method === 'EQUAL' ? 'Equal Split' : method === 'EXACT' ? 'Exact Custom' : 'Percentage'}
                </button>
              ))}
            </div>

            {/* Live Calculation Preview Card */}
            <div className="p-3 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[var(--muted)] flex items-center gap-1">
                  <IconUsers size={13} />
                  Per Flatmate Share:
                </span>
                <span className="mono font-bold text-xs text-[var(--text)]">
                  {perPersonShare.toFixed(2)} {currency} / person
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)]">
                You will be credited <strong className="text-[var(--sage)] font-semibold">+{(numAmount - perPersonShare).toFixed(2)} {currency}</strong> back.
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary h-9 px-4 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] text-[var(--text)] text-xs font-medium hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createExpenseMutation.isPending}
              className="btn-tactile h-9 px-5 rounded-xl border-none bg-[var(--oak)] text-white text-xs font-semibold hover:bg-[var(--oak-hover)] cursor-pointer transition-colors shadow-sm"
            >
              {createExpenseMutation.isPending ? 'Recording...' : 'Log Expense'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
