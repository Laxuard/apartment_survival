import {
  IconAlertTriangle,
  IconArrowsSplit,
  IconCheck,
  IconCoins,
  IconCopy,
  IconHome,
  IconMinus,
  IconPigMoney,
  IconPlus,
  IconQrcode,
  IconScale,
  IconShoppingCart,
  IconTrash,
  IconUsers,
  IconWifi,
} from '@tabler/icons-react';
import { formatSignedMoney, SPLIT_METHODS, type SplitMethod } from '@/domain';
import { QRCodeSVG } from 'qrcode.react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { CURRENCIES } from '../constants/settings.constants';
import type { Roommate } from '@/features/roommates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface HouseholdSettingsTabProps {
  apartmentName: string;
  onApartmentNameChange: (name: string) => void;
  description: string;
  onDescriptionChange: (desc: string) => void;
  monthlyBudget: number;
  onMonthlyBudgetChange: (budget: number) => void;
  capacity: number;
  onCapacityChange: (cap: number) => void;
  memberCount: number;
  roommates?: Roommate[];
  userBalance?: number;
  wifiSsid: string;
  onWifiSsidChange: (ssid: string) => void;
  wifiPassword: string;
  onWifiPasswordChange: (pass: string) => void;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  splitAlgorithm: 'DEBT_SIMPLIFIED' | 'DIRECT';
  onSplitAlgorithmChange: (alg: 'DEBT_SIMPLIFIED' | 'DIRECT') => void;
  defaultSplitMethod?: SplitMethod;
  onDefaultSplitMethodChange?: (method: SplitMethod) => void;
  defaultSplitAllocations?: Record<string, number>;
  onDefaultSplitAllocationsChange?: (allocations: Record<string, number>) => void;
  autoRestockFromExpenses: boolean;
  onToggleAutoRestock: (enabled: boolean) => void;
  householdId?: string;
  copiedInvite: boolean;
  onCopyInvite: () => void;
  copiedWifi: boolean;
  onCopyWifi: () => void;
  onLeaveHousehold?: () => void;
}

export const HouseholdSettingsTab: React.FC<HouseholdSettingsTabProps> = ({
  apartmentName,
  onApartmentNameChange,
  description,
  onDescriptionChange,
  monthlyBudget,
  onMonthlyBudgetChange,
  capacity,
  onCapacityChange,
  memberCount,
  roommates = [],
  userBalance = 0,
  wifiSsid,
  onWifiSsidChange,
  wifiPassword,
  onWifiPasswordChange,
  currency,
  onCurrencyChange,
  splitAlgorithm,
  onSplitAlgorithmChange,
  defaultSplitMethod = 'EQUAL',
  onDefaultSplitMethodChange,
  defaultSplitAllocations = {},
  onDefaultSplitAllocationsChange,
  autoRestockFromExpenses,
  onToggleAutoRestock,
  copiedWifi,
  onCopyWifi,
  onLeaveHousehold,
}) => {
  // Stepper rejection and shake states
  const [isShaking, setIsShaking] = useState(false);
  const [rejectionMsg, setRejectionMsg] = useState(false);

  // WiFi QR Code Preview state
  const [showWifiQr, setShowWifiQr] = useState(false);

  // Leave Confirmation Modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);


  const perPersonBudget = memberCount > 0 ? Math.round(monthlyBudget / memberCount) : monthlyBudget;
  const isAtCapacity = memberCount >= capacity;
  const hasUnsettledDebt = Math.abs(userBalance) > 0.01;

  const effectiveRoommates = roommates.length > 0 ? roommates : [
    { id: 'host-user', name: 'You (Host)', email: '', avatarInitial: 'Y', avatarColor: 'oak' as const, balance: 0, currency, role: 'ADMIN' as const, isCurrentUser: true }
  ];

  const totalAllocated = effectiveRoommates.reduce((sum, r) => {
    const defaultVal = defaultSplitMethod === 'PERCENTAGE'
      ? Math.round((100 / effectiveRoommates.length) * 100) / 100
      : 1;
    const val = defaultSplitAllocations[r.id] !== undefined ? defaultSplitAllocations[r.id] : defaultVal;
    return sum + val;
  }, 0);

  const roundedAllocated = Math.round(totalAllocated * 100) / 100;
  const remainingAllocatedPct = Math.round((100 - roundedAllocated) * 100) / 100;
  const isAllocatedPctValid = Math.abs(remainingAllocatedPct) < 0.05;

  // Local state for split allocations (Tier 2: onBlur persistence)
  const [dirtyAllocations, setDirtyAllocations] = useState<Record<string, number | string>>({});

  const handleFlatmateAllocationChange = (userId: string, val: string) => {
    setDirtyAllocations((prev) => ({
      ...prev,
      [userId]: val,
    }));
  };

  const handleFlatmateAllocationBlur = (userId: string) => {
    const rawVal = dirtyAllocations[userId];
    if (rawVal === undefined) return;

    const parsed = typeof rawVal === 'number' ? rawVal : parseFloat(rawVal as string);
    const safeVal = isNaN(parsed) ? 0 : Math.max(0, parsed);

    const merged = {
      ...defaultSplitAllocations,
      ...dirtyAllocations,
      [userId]: safeVal,
    };

    const numericMap: Record<string, number> = {};
    for (const [k, v] of Object.entries(merged)) {
      const num = typeof v === 'number' ? v : parseFloat(v as string);
      numericMap[k] = isNaN(num) ? 0 : num;
    }

    setDirtyAllocations((prev) => {
      const next = { ...prev };
      delete next[userId];
      return next;
    });
    onDefaultSplitAllocationsChange?.(numericMap);
  };

  const handleDistributeEvenly = () => {
    const count = effectiveRoommates.length;
    const newMap: Record<string, number> = {};
    if (defaultSplitMethod === 'PERCENTAGE') {
      const base = Math.floor((100 / count) * 100) / 100;
      const remainderCents = Math.round((100 - base * count) * 100);
      effectiveRoommates.forEach((r, idx) => {
        newMap[r.id] = idx < remainderCents ? Math.round((base + 0.01) * 100) / 100 : base;
      });
    } else {
      effectiveRoommates.forEach((r) => {
        newMap[r.id] = 1;
      });
    }
    setDirtyAllocations({});
    onDefaultSplitAllocationsChange?.(newMap);
  };

  const handleDecrementCapacity = () => {
    if (capacity <= memberCount) {
      setIsShaking(true);
      setRejectionMsg(true);
      setTimeout(() => setIsShaking(false), 350);
      setTimeout(() => setRejectionMsg(false), 2500);
      return;
    }
    onCapacityChange(capacity - 1);
  };

  const handleIncrementCapacity = () => {
    onCapacityChange(capacity + 1);
  };

  const handleCopyWifiCredentials = () => {
    onCopyWifi();
    toast.info('WiFi credentials copied to clipboard', {
      description: `SSID: ${wifiSsid}`,
    });
  };

  const handleConfirmLeave = () => {
    if (hasUnsettledDebt) return;
    setShowLeaveModal(false);
    onLeaveHousehold?.();
  };

  const wifiQrPayload = `WIFI:T:WPA;S:${wifiSsid};P:${wifiPassword};;`;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Living Space Identity & Capacity */}
      <div className="card-custom overflow-hidden">
        <div className="card-head flex items-center justify-between">
          <div>
            <h3 className="card-title-custom">Living Space Identity & Capacity</h3>
            <div className="card-title-sub">Physical space parameters and flatmate occupancy limits</div>
          </div>
        </div>


        <div className="divide-y divide-[var(--border)]">
          {/* Row: Apartment Name */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label htmlFor="apt-name" className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconHome size={15} className="text-[var(--oak)]" />
                Apartment Name
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                The public label shown on ledgers, receipts, and dashboards.
              </p>
            </div>
            <div className="md:col-span-7">
              <input
                id="apt-name"
                type="text"
                value={apartmentName}
                onChange={(e) => onApartmentNameChange(e.target.value)}
                className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                placeholder="e.g. Skyline Flat"
                required
              />
            </div>
          </div>

          {/* Row: Space Description */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label htmlFor="apt-desc" className="text-xs font-bold text-[var(--text)] block">
                Space Description & Notes
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Short subtitle or address for roommates and guests.
              </p>
            </div>
            <div className="md:col-span-7">
              <input
                id="apt-desc"
                type="text"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium transition-colors"
                placeholder="e.g. 3-Bedroom Flat in Maarif"
              />
            </div>
          </div>

          {/* Row: Member Capacity (Interactive Stepper with Rejection Shake) */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconUsers size={15} className="text-[var(--sage)]" />
                Maximum Flatmate Capacity
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Controls room slots. Cannot go below current active members ({memberCount}).
              </p>
            </div>
            <div className="md:col-span-7 flex flex-wrap items-center gap-3">
              {/* Tactile Animated Stepper */}
              <div
                className={`flex items-center gap-1.5 p-1 rounded-xl bg-[var(--canvas)] border transition-all duration-200 ${isShaking
                    ? 'animate-shake border-[var(--negative-text)] ring-2 ring-[var(--negative-text)]/30'
                    : 'border-[var(--border)]'
                  }`}
              >
                <button
                  type="button"
                  onClick={handleDecrementCapacity}
                  aria-label="Decrease capacity"
                  className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] active:scale-95 transition-all cursor-pointer font-bold select-none"
                >
                  <IconMinus size={14} />
                </button>
                <div className="w-10 text-center font-bold text-xs text-[var(--text)] select-none">
                  {capacity}
                </div>
                <button
                  type="button"
                  onClick={handleIncrementCapacity}
                  aria-label="Increase capacity"
                  className="w-8 h-8 rounded-lg bg-[var(--card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:bg-[var(--border)] active:scale-95 transition-all cursor-pointer font-bold select-none"
                >
                  <IconPlus size={14} />
                </button>
              </div>

              {/* Occupancy Status Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${isAtCapacity
                      ? 'bg-[var(--warn-bg)] text-[var(--warn-text)] border-[var(--warn-text)]/30'
                      : 'bg-[var(--positive-bg)] text-[var(--positive-text)] border-[var(--positive-text)]/30'
                    }`}
                >
                  {memberCount} / {capacity} Occupied
                </span>
                <span className="text-[11px] text-[var(--muted)]">
                  {capacity - memberCount > 0 ? `${capacity - memberCount} slots open` : 'Full capacity'}
                </span>
              </div>

              {/* Rejection Warning Pop */}
              {rejectionMsg && (
                <div className="w-full text-[11px] font-semibold text-[var(--negative-text)] flex items-center gap-1 animate-fade-in pt-1">
                  <IconAlertTriangle size={13} />
                  <span>Cannot set capacity below {memberCount} (current active flatmates).</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Financial Governance & Monthly Target Budget */}
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">Financial Governance & Target Budget</h3>
            <div className="card-title-sub">Shared spending ceilings, primary currency, and ledger algorithms</div>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {/* Row: Monthly Apartment Budget Ceiling */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label htmlFor="apt-budget" className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconPigMoney size={15} className="text-[var(--oak)]" />
                Monthly Target Budget
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Shared spending benchmark that powers Dashboard progress meters.
              </p>
            </div>
            <div className="md:col-span-7 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  id="apt-budget"
                  type="number"
                  step="100"
                  min="0"
                  value={monthlyBudget}
                  onChange={(e) => onMonthlyBudgetChange(parseFloat(e.target.value) || 0)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl pl-3.5 pr-14 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-bold transition-colors"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[var(--muted)] pointer-events-none">
                  {currency}
                </span>
              </div>
              <div className="text-[11px] text-[var(--muted)] shrink-0">
                ≈ <span className="font-bold text-[var(--text)]">{perPersonBudget.toLocaleString()} {currency}</span> / flatmate
              </div>
            </div>
          </div>

          {/* Row: Primary Currency */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconCoins size={15} className="text-[var(--oak)]" />
                Primary Currency
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                All calculations, debts, and expense shares automatically format with this currency.
              </p>
            </div>
            <div className="md:col-span-7 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CURRENCIES.map((c) => {
                  const isSelected = currency === c.code;
                  return (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => onCurrencyChange(c.code)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${isSelected
                          ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/20 shadow-xs'
                          : 'border-[var(--border)] bg-[var(--card)] hover:bg-[var(--canvas)] hover:border-[var(--border-strong)]'
                        }`}
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="w-8 h-8 rounded-lg bg-[var(--canvas)] border border-[var(--border)] flex items-center justify-center mono font-bold text-xs text-[var(--oak)] shrink-0">
                          {c.symbol}
                        </span>
                        <div className="truncate min-w-0">
                          <div className="text-xs font-bold text-[var(--text)]">
                            {c.code} · {c.label}
                          </div>
                          <div className="text-[10px] text-[var(--muted)] truncate">{c.country}</div>
                        </div>
                      </div>
                      {isSelected && <IconCheck size={16} className="text-[var(--oak)] shrink-0 font-bold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row: Debt Simplification Algorithm */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconArrowsSplit size={15} className="text-[var(--sage)]" />
                Settlement Algorithm
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Choose how roommate debts are calculated and balanced across members.
              </p>
            </div>
            <div className="md:col-span-7 space-y-2.5" role="radiogroup" aria-label="Settlement Algorithm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  role="radio"
                  aria-checked={splitAlgorithm === 'DEBT_SIMPLIFIED'}
                  onClick={() => onSplitAlgorithmChange('DEBT_SIMPLIFIED')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${splitAlgorithm === 'DEBT_SIMPLIFIED'
                      ? 'bg-[var(--canvas)] border-[var(--oak)] ring-2 ring-[var(--oak)]/20 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] mb-1">
                    <span>Minimum Cash Flow</span>
                    {splitAlgorithm === 'DEBT_SIMPLIFIED' && <IconCheck size={15} className="text-[var(--oak)]" />}
                  </div>
                  <p className="text-[10.5px] text-[var(--muted)] leading-relaxed">
                    Graph algorithm automatically cancels circular debts to minimize total bank transfers.
                  </p>
                </button>

                <button
                  type="button"
                  role="radio"
                  aria-checked={splitAlgorithm === 'DIRECT'}
                  onClick={() => onSplitAlgorithmChange('DIRECT')}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${splitAlgorithm === 'DIRECT'
                      ? 'bg-[var(--canvas)] border-[var(--oak)] ring-2 ring-[var(--oak)]/20 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                    }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] mb-1">
                    <span>Direct 1-to-1 Ledger</span>
                    {splitAlgorithm === 'DIRECT' && <IconCheck size={15} className="text-[var(--oak)]" />}
                  </div>
                  <p className="text-[10.5px] text-[var(--muted)] leading-relaxed">
                    Maintains explicit individual debt balances between each pair of flatmates.
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* Row: Default Splitting Strategy */}
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            <div className="md:col-span-5 space-y-1">
              <label className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconScale size={15} className="text-[var(--oak)]" />
                Default Splitting Strategy
              </label>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                Applied automatically to all new household expenses and recurring bills unless overridden per expense.
              </p>
            </div>
            <div className="md:col-span-7 space-y-2.5" role="radiogroup" aria-label="Default Splitting Strategy">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SPLIT_METHODS.map((method) => {
                  const isSelected = defaultSplitMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onDefaultSplitMethodChange?.(method.id)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all active:scale-[0.98] ${isSelected
                          ? 'bg-[var(--canvas)] border-[var(--oak)] ring-2 ring-[var(--oak)]/20 shadow-xs'
                          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                        }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-md bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center text-[10px] font-mono font-bold">
                            {method.unitSymbol || '='}
                          </span>
                          <span>{method.label}</span>
                        </div>
                        {isSelected && <IconCheck size={15} className="text-[var(--oak)]" />}
                      </div>
                      <p className="text-[10.5px] text-[var(--muted)] leading-relaxed">
                        {method.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Flatmate Baseline Allocations (Percentage or Shares) */}
              {(defaultSplitMethod === 'PERCENTAGE' || defaultSplitMethod === 'SHARES') && (
                <div className="mt-3 p-4 rounded-xl bg-[var(--canvas)] border border-[var(--border)] space-y-3 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[var(--border)]/60">
                    <div>
                      <div className="text-xs font-bold text-[var(--text)]">
                        {defaultSplitMethod === 'PERCENTAGE' ? 'Default Roommate Percentages' : 'Default Roommate Unit Shares'}
                      </div>
                      <p className="text-[10.5px] text-[var(--muted)]">
                        {defaultSplitMethod === 'PERCENTAGE'
                          ? 'Set default share % per flatmate. Automatically pre-populates on every newly logged expense.'
                          : 'Set ratio weights (e.g. Master Bedroom = 2 shares, Single Bedroom = 1 share).'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={handleDistributeEvenly}
                      >
                        Distribute Evenly
                      </Button>
                      {defaultSplitMethod === 'PERCENTAGE' && (
                        <Badge
                          variant={isAllocatedPctValid ? 'positive' : 'warn'}
                          className="font-mono text-[10px]"
                        >
                          {isAllocatedPctValid ? '✓ 100.00% Allocated' : `${remainingAllocatedPct > 0 ? `${remainingAllocatedPct}% remaining` : `Exceeds by ${Math.abs(remainingAllocatedPct)}%`}`}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                    {effectiveRoommates.map((r) => {
                      const defaultVal = defaultSplitMethod === 'PERCENTAGE'
                        ? Math.round((100 / effectiveRoommates.length) * 100) / 100
                        : 1;
                      const val = dirtyAllocations[r.id] !== undefined
                        ? dirtyAllocations[r.id]
                        : (defaultSplitAllocations[r.id] !== undefined ? defaultSplitAllocations[r.id] : defaultVal);

                      return (
                        <div
                          key={r.id}
                          className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[var(--card)] border border-[var(--border)]"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${r.avatarColor === 'sage'
                                  ? 'bg-[var(--sage-tint)] text-[var(--sage)]'
                                  : 'bg-[var(--oak-tint)] text-[var(--oak)]'
                                }`}
                            >
                              {r.avatarInitial || r.name.charAt(0).toUpperCase()}
                            </span>
                            <div className="truncate">
                              <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
                                <span className="truncate">{r.name}</span>
                                {r.isCurrentUser && (
                                  <span className="text-[10px] text-[var(--muted)] font-normal">(You)</span>
                                )}
                              </div>
                              <div className="text-[10px] text-[var(--muted)] truncate">{r.role || 'Flatmate'}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <div className="relative flex items-center">
                              <Input
                                type="number"
                                step={defaultSplitMethod === 'SHARES' ? '1' : '0.01'}
                                min="0"
                                max={defaultSplitMethod === 'PERCENTAGE' ? '100' : '100'}
                                value={val}
                                onChange={(e) => handleFlatmateAllocationChange(r.id, e.target.value)}
                                onBlur={() => handleFlatmateAllocationBlur(r.id)}
                                className="w-24 h-7 text-xs font-mono text-right pr-8 bg-[var(--canvas)] rounded-lg border-[var(--border)] font-bold text-[var(--text)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-2.5 text-[10px] text-[var(--muted)] font-mono pointer-events-none font-bold select-none">
                                {defaultSplitMethod === 'PERCENTAGE' ? '%' : 'pts'}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. House Connectivity & WiFi with Real Scannable QR Code */}
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">House Connectivity & Shared WiFi</h3>
            <div className="card-title-sub">Network credentials with 1-click copy & instant scannable camera QR</div>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label htmlFor="wifi-ssid" className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                <IconWifi size={15} className="text-[var(--oak)]" />
                Network SSID (Name)
              </label>
              <p className="text-[11px] text-[var(--muted)]">The broadcast name of your router.</p>
            </div>
            <div className="md:col-span-7">
              <input
                id="wifi-ssid"
                type="text"
                value={wifiSsid}
                onChange={(e) => onWifiSsidChange(e.target.value)}
                className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium"
                placeholder="e.g. Home_WiFi"
              />
            </div>
          </div>

          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 space-y-1">
              <label htmlFor="wifi-pass" className="text-xs font-bold text-[var(--text)] block">
                WiFi Password
              </label>
              <p className="text-[11px] text-[var(--muted)]">Roommates & guests can copy or scan to connect.</p>
            </div>
            <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap items-center gap-2">
              <input
                id="wifi-pass"
                type="text"
                value={wifiPassword}
                onChange={(e) => onWifiPasswordChange(e.target.value)}
                className="flex-1 min-w-[160px] bg-[var(--canvas)] text-[var(--text)] text-xs rounded-xl px-3.5 py-2.5 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-mono"
                placeholder="e.g. secret_password"
              />
              <button
                type="button"
                onClick={handleCopyWifiCredentials}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer shrink-0 transition-all duration-200 active:scale-95 shadow-xs ${copiedWifi
                    ? 'bg-[var(--positive-bg)] border-[var(--positive-text)] text-[var(--positive-text)] scale-105'
                    : 'bg-[var(--card)] border-[var(--border-strong)] hover:bg-[var(--sage-tint)] text-[var(--text)]'
                  }`}
              >
                {copiedWifi ? (
                  <IconCheck size={15} className="animate-scale-in text-[var(--positive-text)]" />
                ) : (
                  <IconCopy size={15} />
                )}
                <span>{copiedWifi ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWifiQr(!showWifiQr)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer shrink-0 transition-all active:scale-95 shadow-xs ${showWifiQr
                    ? 'bg-[var(--oak)] text-white border-[var(--oak)]'
                    : 'bg-[var(--card)] border-[var(--border-strong)] hover:bg-[var(--oak-tint)] text-[var(--text)]'
                  }`}
              >
                <IconQrcode size={15} />
                <span>{showWifiQr ? 'Hide QR' : 'WiFi QR'}</span>
              </button>
            </div>
          </div>

          {/* Real Scannable WiFi QR Box */}
          {showWifiQr && (
            <div className="p-5 sm:p-6 bg-[var(--canvas)]/60 flex flex-col sm:flex-row items-center gap-5 animate-fade-in">
              <div className="p-3 bg-white rounded-2xl flex items-center justify-center shadow-md border border-[var(--border)] shrink-0">
                <QRCodeSVG
                  value={wifiQrPayload}
                  size={110}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#1D1913"
                />
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-xs font-bold text-[var(--text)]">Instant Guest Connection QR</div>
                <p className="text-[11px] text-[var(--muted)] leading-relaxed">
                  Point any smartphone camera at this code to join <strong className="text-[var(--text)]">{wifiSsid || 'your network'}</strong> immediately without typing credentials.
                </p>
                <div className="text-[10px] text-[var(--muted)] mono">
                  SSID: {wifiSsid} · WPA Security
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Automation: Stock & Expense Bridge */}
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">Smart Automation & Linking</h3>
            <div className="card-title-sub">Bridges between expense logging and pantry inventory</div>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex items-center justify-between">
          <div className="space-y-0.5 pr-4">
            <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
              <IconShoppingCart size={15} className="text-[var(--oak)]" />
              Auto-Sync Grocery Expenses to Pantry Stock
            </div>
            <p className="text-[11px] text-[var(--muted)] leading-relaxed">
              When flatmates log a grocery expense, automatically offer quick item quantity increments for the Pantry.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={autoRestockFromExpenses}
            onClick={() => onToggleAutoRestock(!autoRestockFromExpenses)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${autoRestockFromExpenses ? 'bg-[var(--oak)]' : 'bg-[var(--border-strong)]'
              }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white transition-transform ${autoRestockFromExpenses ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Danger Zone & Dangling Debt Guardrail */}
      <div className="p-5 sm:p-6 rounded-2xl border border-[var(--negative-text)]/20 bg-[var(--negative-bg)]/25 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-[var(--negative-text)]">Household Danger Zone</h4>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              Irreversible actions related to your apartment membership.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowLeaveModal(true)}
            className="px-3.5 py-1.5 rounded-xl border border-[var(--negative-text)]/40 text-[var(--negative-text)] hover:bg-[var(--negative-text)] hover:text-white text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <IconTrash size={14} />
            <span>Leave Space</span>
          </button>
        </div>
      </div>

      {/* Leave Space Confirmation / Blocked Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="card-custom max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in border border-[var(--border-strong)]">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${hasUnsettledDebt
                  ? 'bg-[var(--warn-bg)] text-[var(--warn-text)]'
                  : 'bg-[var(--negative-bg)] text-[var(--negative-text)]'
                }`}>
                <IconAlertTriangle size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[var(--text)]">
                  {hasUnsettledDebt ? 'Outstanding Balance Detected' : `Leave ${apartmentName}?`}
                </h3>
                <p className="text-[11px] text-[var(--muted)]">Departure verification</p>
              </div>
            </div>

            {hasUnsettledDebt ? (
              <div className="p-3.5 rounded-xl bg-[var(--warn-bg)]/40 border border-[var(--warn-text)]/30 text-xs text-[var(--text)] leading-relaxed space-y-2">
                <p>
                  You cannot leave <strong>{apartmentName}</strong> while you have an active ledger balance of{' '}
                  <strong className="text-[var(--warn-text)] font-mono font-bold">
                    {formatSignedMoney(userBalance, currency)}
                  </strong>.
                </p>
                <p className="text-[11px] text-[var(--muted)]">
                  Please visit the <strong>Roommates</strong> tab to reconcile and settle up all open tabs before departing.
                </p>
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Are you sure you want to leave this living space? You will lose access to shared grocery checklists, settlement tabs, and house notes.
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setShowLeaveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:bg-[var(--canvas)] border border-[var(--border)] transition-all cursor-pointer"
              >
                {hasUnsettledDebt ? 'Understood' : 'Cancel'}
              </button>

              {!hasUnsettledDebt && (
                <button
                  type="button"
                  onClick={handleConfirmLeave}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[var(--negative-text)] hover:opacity-90 transition-all cursor-pointer shadow-xs"
                >
                  Yes, Leave Space
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

