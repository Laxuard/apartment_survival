import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  IconBuildingCommunity,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_CURRENCY, getClientTimezone } from '@/domain';
import { useCreateHouseholdMutation } from '@/features/households';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

interface CreateHouseholdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CURRENCIES = [
  { code: 'MAD', symbol: 'DH', label: 'Moroccan Dirham' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar' },
];

export const CreateHouseholdModal: React.FC<CreateHouseholdModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const setActiveHousehold = useHouseholdStore((s) => s.setActiveHousehold);
  const createMutation = useCreateHouseholdMutation();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
  const [includeStarterTemplates, setIncludeStarterTemplates] = useState(true);

  const isValid = name.trim().length >= 2;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    try {
      const res = await createMutation.mutateAsync({
        name: name.trim(),
        currency,
        timezone: getClientTimezone(),
        maxMembers: 10,
      });

      toast.success(`Created "${res.name}"!`, {
        description: `Primary currency set to ${currency}. Welcome to your dashboard!`,
      });
      setName('');
      setCurrency(DEFAULT_CURRENCY);
      onOpenChange(false);
      setActiveHousehold(res.householdId);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create household';
      toast.error(errorMsg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[540px] p-6 sm:p-8 space-y-6">
        {/* Modal Header with Integrated Ambient Badge */}
        <div className="flex items-center gap-3.5 pr-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--oak)]/10 text-[var(--oak)] border border-[var(--oak)]/25 shadow-2xs">
            <IconBuildingCommunity size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[var(--text)] tracking-tight">
              Create New Space
            </h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Spin up a fresh ledger and shared hub for your apartment or trip.
            </p>
          </div>
        </div>

        <form onSubmit={handleCreate} className="space-y-5">
          {/* Space Name Input */}
          <div className="space-y-2">
            <label htmlFor="spaceName" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] block">
              Space / Apartment Name
            </label>
            <Input
              id="spaceName"
              type="text"
              placeholder="e.g. Casa Flat, Palm Grove Villa, Flat 4B"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
              className="h-12 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-sm text-[var(--text)] px-4 focus-visible:ring-2 focus-visible:ring-[var(--oak)]/40 focus-visible:border-[var(--oak)] transition-all"
            />
          </div>

          {/* Solid Tactile Currency Segment Selector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold uppercase tracking-wider text-[var(--muted)]">
                Base Currency
              </span>
              <span className="text-[11px] text-[var(--muted)]/80 font-medium">
                Locked after setup
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 p-1.5 rounded-2xl bg-[var(--canvas)] border border-[var(--border)]">
              {CURRENCIES.map((curr) => {
                const active = currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-xs transition-all cursor-pointer select-none ${
                      active
                        ? 'bg-[var(--oak)] text-white font-bold shadow-sm ring-1 ring-[var(--oak)]'
                        : 'text-[var(--text)] hover:text-[var(--oak)] hover:bg-[var(--card)]'
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">{curr.code}</span>
                    <span className={`text-[10.5px] mt-0.5 ${active ? 'text-white/90 font-semibold' : 'text-[var(--muted)]'}`}>
                      {curr.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upgraded Starter Items Preset Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setIncludeStarterTemplates(!includeStarterTemplates)}
            onKeyDown={(e) => {
              if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                setIncludeStarterTemplates(!includeStarterTemplates);
              }
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
              includeStarterTemplates
                ? 'bg-[var(--oak)]/5 border-[var(--oak)]/30 ring-1 ring-[var(--oak)]/20 shadow-2xs'
                : 'bg-[var(--canvas)] border-[var(--border)] opacity-75 hover:opacity-100 hover:border-[var(--border-strong)]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-all shrink-0 ${
                includeStarterTemplates
                  ? 'bg-[var(--oak)] border-[var(--oak)] text-white shadow-2xs'
                  : 'border-[var(--border-strong)] bg-[var(--card)]'
              }`}
            >
              {includeStarterTemplates && <IconCheck size={13} strokeWidth={2.5} />}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-bold text-[var(--text)] flex items-center gap-1.5">
                  <IconSparkles size={14} className="text-[var(--oak)]" />
                  <span>Auto-seed Starter Essentials</span>
                </div>
                {includeStarterTemplates && (
                  <Badge variant="default" className="text-[9.5px] uppercase tracking-wider py-0 px-2 h-5 font-bold">
                    Recommended
                  </Badge>
                )}
              </div>
              <p className="text-[11.5px] text-[var(--muted)] leading-relaxed">
                Pre-populates Wi-Fi & Rent schedules, plus pantry restock trackers (Coffee, Milk, Olive Oil, Eggs).
              </p>
            </div>
          </div>

          {/* Action Buttons & Post-Creation Expectation */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-12 rounded-xl text-xs sm:text-sm font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || !isValid}
                className="flex-1 h-12 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer disabled:opacity-50"
              >
                {createMutation.isPending ? 'Launching space...' : 'Launch Space & Ledger →'}
              </Button>
            </div>
            <p className="text-center text-[11px] text-[var(--muted)] font-medium">
              ⚡ You'll get a shareable WhatsApp invite code immediately after launch.
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
