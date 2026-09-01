import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IconBolt,
  IconCup,
  IconHome2,
  IconReceipt2,
  IconScale,
  IconShoppingCart,
  IconCheck,
  IconAlertCircle,
  IconSparkles,
  IconTools,
  IconDeviceTv,
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  calculateParticipantShares,
  formatMoney,
  SPLIT_METHODS,
  type SplitMethod,
  type SplitParticipantInput,
} from '@/domain';
import { useCreateExpenseMutation } from '@/features/expenses/hooks/useExpensesQueries';
import { useRoommatesQuery } from '@/features/roommates';
import { useActiveHousehold } from '@/features/households';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';

const CATEGORIES = [
  { value: 'GROCERIES', label: 'Groceries', icon: IconShoppingCart },
  { value: 'UTILITIES', label: 'Utilities', icon: IconBolt },
  { value: 'RENT', label: 'Rent', icon: IconHome2 },
  { value: 'FOOD_DINING', label: 'Dining', icon: IconCup },
  { value: 'CLEANING', label: 'Cleaning', icon: IconSparkles },
  { value: 'MAINTENANCE', label: 'Repairs', icon: IconTools },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: IconDeviceTv },
  { value: 'OTHER', label: 'Other', icon: IconReceipt2 },
];

export const ExpenseModal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeModal, expensePrefill, closeModal } = useUIStore();
  const isOpen = activeModal === 'expense';
  const { activeHousehold, activeHouseholdId, activeCurrency: currency } = useActiveHousehold();

  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);
  const householdDefaultMethod = (activeHousehold?.defaultSplitMethod as SplitMethod) || 'EQUAL';

  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>('GROCERIES');
  const [selectedSplitMethod, setSelectedSplitMethod] = useState<SplitMethod>('EQUAL');
  const [excludedMemberIds, setExcludedMemberIds] = useState<Record<string, boolean>>({});
  const [customAllocations, setCustomAllocations] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState('');

  // Keep state in sync with prefill and modal opens
  const [prevOpen, setPrevOpen] = useState(false);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (isOpen && expensePrefill) {
      setAmount(expensePrefill.amount ? expensePrefill.amount.toString() : '');
      setTitle(expensePrefill.title || '');
      setCategory(expensePrefill.category || 'GROCERIES');
      setSelectedSplitMethod(householdDefaultMethod);
      setExcludedMemberIds({});
      setCustomAllocations({});
      setValidationError('');
    } else if (!isOpen) {
      setAmount('');
      setTitle('');
      setCategory('GROCERIES');
      setSelectedSplitMethod(householdDefaultMethod);
      setExcludedMemberIds({});
      setCustomAllocations({});
      setValidationError('');
    }
  }

  // All roommates or fallback to current user
  const allMembers = useMemo(() => {
    if (roommates.length > 0) {
      return roommates.map((r) => ({
        userId: r.id,
        userName: r.name,
        avatarColor: r.avatarColor,
        avatarInitial: r.avatarInitial,
        isCurrentUser: r.isCurrentUser ?? (r.id === user?.id),
      }));
    }
    if (user?.id) {
      return [
        {
          userId: user.id,
          userName: user.name || 'You',
          avatarColor: 'oak' as const,
          avatarInitial: (user.name || 'Y').charAt(0).toUpperCase(),
          isCurrentUser: true,
        },
      ];
    }
    return [];
  }, [roommates, user]);

  const currentUserMember = allMembers.find((m) => m.isCurrentUser) || allMembers[0];
  const [paidByUserId, setPaidByUserId] = useState<string>('');
  const effectivePaidByUserId = paidByUserId || currentUserMember?.userId || '';

  // Filter participants by inclusion status for calculation
  const activeParticipants: SplitParticipantInput[] = useMemo(() => {
    return allMembers
      .filter((m) => !excludedMemberIds[m.userId])
      .map((m) => ({
        userId: m.userId,
        userName: m.userName,
        avatarColor: m.avatarColor,
        avatarInitial: m.avatarInitial,
        isCurrentUser: m.isCurrentUser,
        isPayer: m.userId === effectivePaidByUserId,
      }));
  }, [allMembers, excludedMemberIds, effectivePaidByUserId]);

  const createExpenseMutation = useCreateExpenseMutation(activeHouseholdId);
  const numAmount = parseFloat(amount) || 0;

  // Real-time calculation engine using domain calculator
  const splitCalculation = useMemo(() => {
    return calculateParticipantShares({
      totalAmount: numAmount,
      participants: activeParticipants,
      splitMethod: selectedSplitMethod,
      householdDefaultSplitMethod: householdDefaultMethod,
      householdDefaultAllocations: activeHousehold?.defaultSplitAllocations,
      customAllocations,
      payerId: effectivePaidByUserId,
    });
  }, [
    numAmount,
    activeParticipants,
    selectedSplitMethod,
    householdDefaultMethod,
    activeHousehold?.defaultSplitAllocations,
    customAllocations,
    effectivePaidByUserId,
  ]);

  const handleToggleMember = (userId: string) => {
    setExcludedMemberIds((prev) => {
      const isCurrentlyExcluded = !!prev[userId];
      const next = { ...prev };
      if (isCurrentlyExcluded) {
        delete next[userId];
      } else {
        // Prevent excluding all participants
        const remainingActive = allMembers.filter((m) => m.userId !== userId && !prev[m.userId]);
        if (remainingActive.length === 0) {
          toast.warning('At least one flatmate must be included.');
          return prev;
        }
        next[userId] = true;
      }
      return next;
    });
  };

  const handleCustomAllocationChange = (userId: string, val: string) => {
    const parsed = parseFloat(val);
    setCustomAllocations((prev) => ({
      ...prev,
      [userId]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handleSplitMethodSelect = (method: SplitMethod) => {
    setSelectedSplitMethod(method);
    setCustomAllocations({});
  };

  const isBalanced = splitCalculation.isValid && numAmount > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numAmount || numAmount <= 0) {
      setValidationError('Please enter a valid expense total amount.');
      return;
    }
    if (!title.trim()) {
      setValidationError('Please enter a description or memo for the expense.');
      return;
    }
    if (activeParticipants.length === 0) {
      setValidationError('At least one flatmate must participate in the split.');
      return;
    }
    if (!splitCalculation.isValid) {
      setValidationError(splitCalculation.validationError || 'Invalid split allocation.');
      return;
    }
    setValidationError('');

    const expenseTitle = title.trim();
    const expenseCategory = category;

    // Backend-aligned payload structure matching ExpenseRequest.Create & SplitItem
    const validSplits = splitCalculation.shares
      .filter((s) => s.userId && s.userId !== 'current-user' && s.userId.length >= 32)
      .map((s) => ({
        userId: s.userId,
        amount: s.assignedAmount,
        assignedAmount: s.assignedAmount,
        splitValue: s.splitValue,
        percentage: s.percentage,
        shares: s.shares,
      }));

    createExpenseMutation.mutate(
      {
        title: expenseTitle,
        amount: numAmount,
        category: expenseCategory,
        splitType: selectedSplitMethod,
        expenseDate: new Date().toISOString(),
        splits: validSplits.length > 0 ? validSplits : undefined,
      },
      {
        onSuccess: () => {
          closeModal();
          setAmount('');
          setTitle('');
          setCustomAllocations({});
          setExcludedMemberIds({});

          const formattedTotal = formatMoney(numAmount, currency);
          const formattedShare = formatMoney(splitCalculation.perPersonEqualShare, currency);

          if (expenseCategory === 'GROCERIES') {
            toast.success(`Logged grocery expense: ${expenseTitle}`, {
              description: `Total: ${formattedTotal} (${formattedShare} avg / flatmate)`,
              action: {
                label: 'Restock in Pantry 🛒',
                onClick: () => navigate('/pantry'),
              },
            });
          } else {
            toast.success(`Logged expense: ${expenseTitle}`, {
              description: `Total: ${formattedTotal} (${formattedShare} avg / flatmate)`,
            });
          }
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to record expense.');
        },
      }
    );
  };

  const isCurrentPayer = effectivePaidByUserId === currentUserMember?.userId;
  const userShare = splitCalculation.shares.find((s) => s.userId === currentUserMember?.userId)?.assignedAmount || 0;
  const userNetPosition = isCurrentPayer
    ? numAmount - userShare
    : -userShare;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-3xl bg-[var(--card)] border border-[var(--border)] shadow-2xl">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col">
          {/* Header */}
          <DialogHeader className="flex flex-row items-center justify-between px-7 py-5 border-b border-[var(--border)] bg-[var(--canvas)]/40 space-y-0">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--oak)]/10 text-[var(--oak)] border border-[var(--oak)]/20 font-bold shrink-0">
                <IconSparkles size={22} />
              </div>
              <div>
                <DialogTitle className="font-serif text-lg font-bold text-[var(--text)] leading-tight">
                  Log Household Expense
                </DialogTitle>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Record a shared purchase to update the household ledger
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Validation Banner if any */}
          {validationError && (
            <div className="mx-7 mt-4 text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] border border-[var(--negative-text)]/30 p-3 rounded-xl flex items-center gap-2.5 animate-fade-in">
              <IconAlertCircle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* 2-Column Split Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
            {/* LEFT COLUMN: Metadata */}
            <div className="p-7 space-y-5">
              {/* Amount Hero */}
              <div className="space-y-1.5">
                <label htmlFor="exp-amount" className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Expense Total Amount
                </label>
                <div className="relative flex items-center rounded-2xl border border-[var(--border)] bg-[var(--canvas)] focus-within:ring-2 focus-within:ring-[var(--oak)]/40 focus-within:border-[var(--oak)] transition-all">
                  <span className="pl-4 text-sm font-mono font-bold text-[var(--muted)] select-none">
                    {currency}
                  </span>
                  <input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    autoFocus
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full h-13 pl-3 pr-4 bg-transparent font-mono text-2xl font-bold text-[var(--text)] placeholder:text-[var(--muted)]/40 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Title / Memo */}
              <div className="space-y-1.5">
                <label htmlFor="exp-title" className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Description / Memo
                </label>
                <input
                  id="exp-title"
                  type="text"
                  placeholder="e.g. Weekly Carrefour Haul, Wi-Fi Bill"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-sm text-[var(--text)] placeholder:text-[var(--muted)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--oak)]/40 transition-all duration-150"
                />
              </div>

              {/* Category: 4x2 Grid */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const active = category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl text-xs border cursor-pointer select-none transition-all duration-150 ease-out active:scale-95 ${
                          active
                            ? 'bg-[var(--oak)] text-white border-[var(--oak)] font-medium shadow-xs'
                            : 'bg-[var(--canvas)] border-[var(--border)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--border-strong)]'
                        }`}
                      >
                        <Icon size={18} className="mb-1.5 shrink-0 transition-transform duration-150" />
                        <span className="truncate w-full text-center text-[11px] leading-tight font-medium">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Paid Upfront By - Custom Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Paid Upfront By
                </label>
                <Select
                  value={effectivePaidByUserId}
                  onValueChange={(val) => val && setPaidByUserId(val)}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-xs font-medium text-[var(--text)] focus:ring-2 focus:ring-[var(--oak)]/40 px-3.5">
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          currentUserMember?.avatarColor === 'sage'
                            ? 'bg-[var(--sage-tint)] text-[var(--sage)]'
                            : 'bg-[var(--oak-tint)] text-[var(--oak)]'
                        }`}
                      >
                        {(allMembers.find((m) => m.userId === effectivePaidByUserId)?.avatarInitial) || 'Y'}
                      </span>
                      <span className="text-xs font-medium truncate">
                        {allMembers.find((m) => m.userId === effectivePaidByUserId)?.userName || 'You'}
                        {allMembers.find((m) => m.userId === effectivePaidByUserId)?.isCurrentUser ? ' (You)' : ''}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--card)] border border-[var(--border-strong)] rounded-xl shadow-xl">
                    {allMembers.map((m) => (
                      <SelectItem
                        key={m.userId}
                        value={m.userId}
                        className="text-xs text-[var(--text)] hover:bg-[var(--canvas)] focus:bg-[var(--canvas)] cursor-pointer py-2.5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                              m.avatarColor === 'sage'
                                ? 'bg-[var(--sage-tint)] text-[var(--sage)]'
                                : 'bg-[var(--oak-tint)] text-[var(--oak)]'
                            }`}
                          >
                            {m.avatarInitial || m.userName.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium">{m.userName} {m.isCurrentUser ? '(You)' : ''}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* RIGHT COLUMN: Split Allocations */}
            <div className="p-7 flex flex-col justify-between space-y-4 bg-[var(--canvas)]/15">
              <div className="space-y-4">
                {/* Strategy Switcher */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                      <IconScale size={15} className="text-[var(--oak)]" />
                      <span>Split Strategy</span>
                    </span>
                    <span className="text-[11px] text-[var(--muted)] font-mono">
                      {activeParticipants.length} Active Participants
                    </span>
                  </div>

                  <div className="relative p-1 bg-[var(--canvas)] border border-[var(--border)] rounded-xl flex items-center">
                    {/* Sliding Active Pill */}
                    <div
                      className={`absolute top-1 bottom-1 left-1 w-[calc(25%-3px)] bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xs transition-transform duration-200 ease-out pointer-events-none ${
                        selectedSplitMethod === 'EQUAL'
                          ? 'translate-x-0'
                          : selectedSplitMethod === 'PERCENTAGE'
                          ? 'translate-x-full'
                          : selectedSplitMethod === 'EXACT'
                          ? 'translate-x-[200%]'
                          : 'translate-x-[300%]'
                      }`}
                    />

                    {SPLIT_METHODS.map((method) => {
                      const active = selectedSplitMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => handleSplitMethodSelect(method.id)}
                          className={`relative z-10 flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer select-none outline-none ${
                            active
                              ? 'text-[var(--oak)] font-bold'
                              : 'text-[var(--muted)] hover:text-[var(--text)]'
                          }`}
                        >
                          {method.id === 'EQUAL'
                            ? '= Equal'
                            : method.id === 'PERCENTAGE'
                            ? '%'
                            : method.id === 'EXACT'
                            ? 'Exact'
                            : 'Shares'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Flatmate Allocations List */}
                <div className="space-y-2 min-h-[160px] max-h-[220px] overflow-y-auto pr-1">
                  {allMembers.map((member) => {
                    const isIncluded = !excludedMemberIds[member.userId];
                    const share = splitCalculation.shares.find((s) => s.userId === member.userId);
                    const assignedShareAmount = share?.assignedAmount || 0;

                    const rawVal = customAllocations[member.userId] !== undefined
                      ? customAllocations[member.userId]
                      : selectedSplitMethod === 'PERCENTAGE'
                        ? share?.percentage ?? ''
                        : selectedSplitMethod === 'EXACT'
                          ? share?.assignedAmount ?? ''
                          : share?.shares ?? 1;

                    return (
                      <div
                        key={member.userId}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                          isIncluded
                            ? 'bg-[var(--card)] border-[var(--border)]'
                            : 'bg-transparent border-dashed border-[var(--border)] opacity-40'
                        }`}
                      >
                        {/* Flatmate Identity & Checkbox */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleMember(member.userId)}
                            aria-label={`Toggle ${member.userName}`}
                            className={`h-5 w-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                              isIncluded
                                ? 'bg-[var(--oak)] border-[var(--oak)] text-white shadow-2xs'
                                : 'border-[var(--border-strong)] bg-transparent'
                            }`}
                          >
                            {isIncluded && <IconCheck size={13} strokeWidth={3} />}
                          </button>

                          <div className="flex items-center gap-2 truncate">
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                member.avatarColor === 'sage'
                                  ? 'bg-[var(--sage-tint)] text-[var(--sage)]'
                                  : 'bg-[var(--oak-tint)] text-[var(--oak)]'
                              }`}
                            >
                              {member.avatarInitial || member.userName.charAt(0).toUpperCase()}
                            </span>
                            <span className="text-xs font-medium text-[var(--text)] truncate">
                              {member.userName} {member.isCurrentUser ? '(You)' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Configurable Split Input & Calculated Result */}
                        <div className="flex items-center gap-2.5 shrink-0">
                          {selectedSplitMethod !== 'EQUAL' && isIncluded && (
                            <div className="relative w-20">
                              <input
                                type="number"
                                step={selectedSplitMethod === 'SHARES' ? '1' : '0.01'}
                                min="0"
                                value={rawVal}
                                onChange={(e) => handleCustomAllocationChange(member.userId, e.target.value)}
                                className="w-full h-8 pr-5 pl-1.5 text-right rounded-lg bg-[var(--canvas)] border border-[var(--border)] text-xs font-mono font-medium text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--oak)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)] font-mono pointer-events-none">
                                {selectedSplitMethod === 'PERCENTAGE'
                                  ? '%'
                                  : selectedSplitMethod === 'SHARES'
                                  ? 'pts'
                                  : currency}
                              </span>
                            </div>
                          )}

                          <span className="w-24 text-right font-mono text-xs font-bold text-[var(--text)] tabular-nums">
                            {isIncluded ? formatMoney(assignedShareAmount, currency) : `0.00 ${currency}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Invariant Status Bar */}
              <div className="rounded-xl bg-[var(--canvas)] border border-[var(--border)] px-3.5 py-2.5 flex items-center justify-between text-xs font-mono">
                <span className="text-[var(--muted)] font-sans text-[11px]">Status:</span>
                <span
                  className={`flex items-center gap-1.5 font-medium ${
                    numAmount <= 0
                      ? 'text-[var(--muted)] font-sans'
                      : isBalanced
                      ? 'text-emerald-500'
                      : 'text-amber-500'
                  }`}
                >
                  {numAmount <= 0 ? (
                    'Enter total amount'
                  ) : isBalanced ? (
                    <>
                      <IconCheck size={15} strokeWidth={2.5} /> 100% Balanced
                    </>
                  ) : (
                    <>
                      <IconAlertCircle size={15} />
                      {splitCalculation.remainingToAllocate > 0
                        ? `${formatMoney(splitCalculation.remainingToAllocate, currency)} unallocated`
                        : `${formatMoney(Math.abs(splitCalculation.remainingToAllocate), currency)} over`}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 py-4.5 border-t border-[var(--border)] bg-[var(--canvas)]/40">
            <div className="text-xs text-[var(--muted)]">
              {numAmount > 0 && isBalanced && (
                isCurrentPayer ? (
                  <span>
                    Net: You will be credited{' '}
                    <strong className="text-emerald-500 font-mono text-xs">
                      +{userNetPosition.toFixed(2)} {currency}
                    </strong>
                  </span>
                ) : (
                  <span>
                    Net: You will owe{' '}
                    <strong className="text-amber-500 font-mono text-xs">
                      -{Math.abs(userNetPosition).toFixed(2)} {currency}
                    </strong>
                  </span>
                )
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="h-10 px-4.5 text-xs rounded-xl border-[var(--border)] text-[var(--text)] hover:bg-[var(--canvas)] cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createExpenseMutation.isPending || !isBalanced || !title.trim()}
                className="h-10 px-5 text-xs rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-semibold shadow-xs disabled:opacity-40 cursor-pointer"
              >
                {createExpenseMutation.isPending ? 'Recording...' : 'Record Expense'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


