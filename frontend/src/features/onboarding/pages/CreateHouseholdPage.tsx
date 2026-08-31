import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCreateHouseholdMutation } from '@/features/households';
import { IconArrowLeft, IconCheck, IconCoins, IconHome, IconSparkles } from '@tabler/icons-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const CURRENCY_OPTIONS = [
  { value: 'MAD', label: 'Moroccan Dirham (MAD)', symbol: 'MAD' },
  { value: 'EUR', label: 'Euro (EUR)', symbol: '€' },
  { value: 'USD', label: 'US Dollar (USD)', symbol: '$' },
  { value: 'GBP', label: 'British Pound (GBP)', symbol: '£' },
] as const;

export const CreateHouseholdPage: React.FC = () => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<string>('MAD');
  const [includeStarterTemplates, setIncludeStarterTemplates] = useState(true);
  const navigate = useNavigate();

  const createMutation = useCreateHouseholdMutation();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createMutation.mutate(
      {
        name: name.trim(),
        currency,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        maxMembers: 10,
      },
      {
        onSuccess: (data) => {
          toast.success(`Created "${data.name}"!`, {
            description: `Primary currency set to ${currency}. Welcome to your dashboard!`,
          });
          navigate('/dashboard', { replace: true });
        },
      }
    );
  };

  return (
    <div className="card-custom p-6 sm:p-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl space-y-6">
      <Link
        to="/onboarding"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        <IconArrowLeft size={14} /> Back to options
      </Link>

      <div className="space-y-1.5">
        <div className="w-11 h-11 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center mb-1 shadow-2xs">
          <IconHome size={22} />
        </div>
        <h1 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight">
          Create your apartment
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Give your apartment a name, choose your shared currency, and set up your ledger.
        </p>
      </div>

      {createMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-3 rounded-xl border border-[var(--negative-text)]/20">
          {createMutation.error.message}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-5">
        {/* Apartment Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[var(--text)] block">Apartment Name or Unit</label>
          <Input
            type="text"
            placeholder="e.g. Apartment 4B, Palm Grove Villa, Flat 12"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="h-10.5 rounded-xl bg-[var(--canvas)] border-[var(--border-strong)] text-xs"
          />
        </div>

        {/* Currency Selection Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <IconCoins size={14} className="text-[var(--oak)]" />
              <span>Primary Currency</span>
            </label>
            <span className="text-[11px] text-[var(--muted)]">Cannot be changed later</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {CURRENCY_OPTIONS.map((c) => {
              const isSelected = currency === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCurrency(c.value)}
                  className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                      ? 'border-[var(--oak)] bg-[var(--oak-tint)]/80 ring-2 ring-[var(--oak)]/20 shadow-xs'
                      : 'border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--border-strong)]'
                    }`}
                >
                  <div>
                    <div className="text-xs font-bold text-[var(--text)]">{c.value}</div>
                    <div className="text-[10px] text-[var(--muted)]">{c.label}</div>
                  </div>
                  <span className="font-mono text-xs font-bold text-[var(--oak)]">{c.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Starter Template Toggle */}
        <button
          type="button"
          role="checkbox"
          aria-checked={includeStarterTemplates}
          onClick={() => setIncludeStarterTemplates(!includeStarterTemplates)}
          className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--canvas)] hover:border-[var(--border-strong)] transition-colors flex items-start gap-3 cursor-pointer select-none w-full text-left"
        >
          <div
            className={`w-5 h-5 rounded-lg border flex items-center justify-center mt-0.5 transition-colors shrink-0 ${includeStarterTemplates
                ? 'bg-[var(--oak)] border-[var(--oak)] text-white'
                : 'border-[var(--border-strong)] bg-[var(--card)]'
              }`}
          >
            {includeStarterTemplates && <IconCheck size={13} />}
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-[var(--text)] flex items-center gap-1.5">
              <IconSparkles size={13} className="text-[var(--sage)]" />
              <span>Pre-populate starter items</span>
            </div>
            <p className="text-[11px] text-[var(--muted)]">
              Automatically seeds Wi-Fi & Rent recurring bills and essential pantry restock trackers (Coffee, Eggs, Milk, Olive Oil).
            </p>
          </div>
        </button>

        <Button
          type="submit"
          disabled={createMutation.isPending || !name.trim()}
          className="btn-tactile w-full h-11 rounded-xl bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs sm:text-sm font-semibold shadow-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {createMutation.isPending ? 'Building your household...' : 'Create Apartment & Launch'}
        </Button>
      </form>
    </div>
  );
};
