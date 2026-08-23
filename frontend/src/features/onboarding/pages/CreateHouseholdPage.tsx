import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IconArrowLeft, IconHome } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useCreateHouseholdMutation } from '@/features/households/api/useHouseholdsQuery';

const CURRENCY_OPTIONS = [
  { value: 'MAD', label: 'MAD (Moroccan Dirham)' },
  { value: 'EUR', label: 'EUR (Euro)' },
  { value: 'USD', label: 'USD (US Dollar)' },
  { value: 'GBP', label: 'GBP (British Pound)' },
] as const;

export const CreateHouseholdPage: React.FC = () => {
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState<string>('MAD');
  const navigate = useNavigate();

  const createMutation = useCreateHouseholdMutation();

  const activeCurrencyLabel =
    CURRENCY_OPTIONS.find((c) => c.value === currency)?.label || 'MAD (Moroccan Dirham)';

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
        onSuccess: () => {
          navigate('/', { replace: true });
        },
      }
    );
  };

  return (
    <div className="card-custom p-6 space-y-6">
      <Link
        to="/onboarding"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors"
      >
        <IconArrowLeft size={14} /> Back to options
      </Link>

      <div className="space-y-1">
        <div className="w-10 h-10 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center mb-2">
          <IconHome size={20} />
        </div>
        <h1 className="font-serif text-xl font-bold text-[var(--text)]">Create your apartment</h1>
        <p className="text-xs text-[var(--muted)]">
          Give your apartment a name and select your household's primary currency.
        </p>
      </div>

      {createMutation.isError && (
        <div className="text-xs text-[var(--negative-text)] bg-[var(--negative-bg)] p-2.5 rounded-lg">
          {createMutation.error.message}
        </div>
      )}

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[12.5px] font-medium text-[var(--muted)]">Apartment / Household Name</label>
          <Input
            type="text"
            placeholder="e.g. Apartment 4B, Green Villa"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[12.5px] font-medium text-[var(--muted)]">Primary Currency</label>
          <Select value={currency} onValueChange={(val: string | null) => val && setCurrency(val)}>
            <SelectTrigger>
              <span className="truncate">{activeCurrencyLabel}</span>
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white font-medium py-5 cursor-pointer"
        >
          {createMutation.isPending ? 'Creating flat...' : 'Create Apartment & Continue'}
        </Button>
      </form>
    </div>
  );
};
