import React, { useState } from 'react';
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconCheck,
  IconCoins,
  IconArrowsSplit,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

export const SettingsPage: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  const { getActiveHousehold, updateActiveHousehold } = useHouseholdStore();
  const activeHousehold = getActiveHousehold();

  const [apartmentName, setApartmentName] = useState(activeHousehold?.name || 'Apartment 4B');
  const [currency, setCurrency] = useState(activeHousehold?.currency || 'MAD');
  const [splitAlgorithm, setSplitAlgorithm] = useState<'DEBT_SIMPLIFIED' | 'DIRECT'>(
    activeHousehold?.splitAlgorithm || 'DEBT_SIMPLIFIED'
  );
  const [notifyLowStock, setNotifyLowStock] = useState(true);
  const [notifyOverdue, setNotifyOverdue] = useState(true);
  const [savedToast, setSavedToast] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateActiveHousehold({
      name: apartmentName.trim() || 'Apartment 4B',
      currency,
      splitAlgorithm,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {savedToast && (
        <div className="flex justify-end">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--positive-text)] bg-[var(--positive-bg)] px-3 py-1.5 rounded-xl border border-[var(--positive-text)] animate-fade-in">
            <IconCheck size={15} /> Preferences Saved Successfully!
          </span>
        </div>
      )}

      <form onSubmit={handleSavePreferences} className="space-y-6">
        {/* 1. Appearance Section */}
        <div className="card-custom">
          <div className="card-head">
            <div className="flex items-center gap-2">
              <h2 className="card-title-custom">Interface Theme</h2>
              <span className="text-[11px] text-[var(--muted)]">Choose your visual aesthetic</span>
            </div>
          </div>

          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Light Mode Tile */}
              <button
                type="button"
                onClick={() => setMode('light')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                  mode === 'light'
                    ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/20 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IconSun size={20} className={mode === 'light' ? 'text-[var(--oak)]' : 'text-[var(--muted)]'} />
                  {mode === 'light' && <IconCheck size={16} className="text-[var(--oak)]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Terracotta & Linen</div>
                  <div className="text-[11px] text-[var(--muted)]">Warm light aesthetic</div>
                </div>
              </button>

              {/* Dark Mode Tile */}
              <button
                type="button"
                onClick={() => setMode('dark')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                  mode === 'dark'
                    ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/20 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IconMoon size={20} className={mode === 'dark' ? 'text-[var(--oak)]' : 'text-[var(--muted)]'} />
                  {mode === 'dark' && <IconCheck size={16} className="text-[var(--oak)]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">Espresso & Oak</div>
                  <div className="text-[11px] text-[var(--muted)]">Deep contrast dark mode</div>
                </div>
              </button>

              {/* System Mode Tile */}
              <button
                type="button"
                onClick={() => setMode('system')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-28 transition-all cursor-pointer ${
                  mode === 'system'
                    ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/20 shadow-sm'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <IconDeviceDesktop size={20} className={mode === 'system' ? 'text-[var(--oak)]' : 'text-[var(--muted)]'} />
                  {mode === 'system' && <IconCheck size={16} className="text-[var(--oak)]" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--text)]">System Default</div>
                  <div className="text-[11px] text-[var(--muted)]">Sync with OS appearance</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Apartment Parameters */}
        <div className="card-custom">
          <div className="card-head">
            <h2 className="card-title-custom">Apartment Information</h2>
          </div>

          <div className="p-4 sm:p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted)] block">
                  Apartment / Household Name
                </label>
                <input
                  type="text"
                  value={apartmentName}
                  onChange={(e) => setApartmentName(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-lg px-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-[var(--muted)] block flex items-center gap-1">
                  <IconCoins size={14} className="text-[var(--oak)]" />
                  Primary Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[var(--canvas)] text-[var(--text)] text-xs rounded-lg px-3 py-2 border border-[var(--border)] focus:outline-none focus:border-[var(--oak)] cursor-pointer"
                >
                  <option value="MAD">MAD (Moroccan Dirham)</option>
                  <option value="USD">USD ($ United States Dollar)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="CAD">CAD ($ Canadian Dollar)</option>
                </select>
              </div>
            </div>

            {/* Algorithm Strategy */}
            <div className="space-y-2 pt-3 border-t border-[var(--border)]">
              <label className="text-xs font-medium text-[var(--muted)] block flex items-center gap-1.5">
                <IconArrowsSplit size={15} className="text-[var(--sage)]" />
                Debt Simplification Algorithm
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  onClick={() => setSplitAlgorithm('DEBT_SIMPLIFIED')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    splitAlgorithm === 'DEBT_SIMPLIFIED'
                      ? 'bg-[var(--canvas)] border-[var(--oak)] ring-1 ring-[var(--oak)]'
                      : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] mb-1">
                    <span>Minimum Cash Flow</span>
                    {splitAlgorithm === 'DEBT_SIMPLIFIED' && <IconCheck size={14} className="text-[var(--oak)]" />}
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    Minimizes total payment transfers across roommates automatically.
                  </p>
                </div>

                <div 
                  onClick={() => setSplitAlgorithm('DIRECT')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    splitAlgorithm === 'DIRECT'
                      ? 'bg-[var(--canvas)] border-[var(--oak)] ring-1 ring-[var(--oak)]'
                      : 'bg-[var(--card)] border-[var(--border)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[var(--text)] mb-1">
                    <span>Direct 1-to-1 Ledger</span>
                    {splitAlgorithm === 'DIRECT' && <IconCheck size={14} className="text-[var(--oak)]" />}
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">
                    Every expense maintains separate individual debt lines between roommates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Notifications & Reminders */}
        <div className="card-custom">
          <div className="card-head">
            <h2 className="card-title-custom">Alerts & Nudges</h2>
          </div>

          <div className="divide-y divide-[var(--border)] px-4 sm:px-5">
            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text)]">Pantry Low Stock Warnings</div>
                <div className="text-[11px] text-[var(--muted)]">Notify flatmates when essentials drop to critical levels</div>
              </div>
              <input
                type="checkbox"
                checked={notifyLowStock}
                onChange={(e) => setNotifyLowStock(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--oak)] focus:ring-[var(--oak)] accent-[var(--oak)] cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <div className="text-xs font-semibold text-[var(--text)]">Overdue Bill & Settle Reminders</div>
                <div className="text-[11px] text-[var(--muted)]">Display overdue debt badges on roommate ledger cards</div>
              </div>
              <input
                type="checkbox"
                checked={notifyOverdue}
                onChange={(e) => setNotifyOverdue(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--oak)] focus:ring-[var(--oak)] accent-[var(--oak)] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            className="btn-tactile bg-[var(--oak)] hover:bg-[var(--oak-hover)] text-white text-xs font-semibold px-6 py-2 shadow-sm cursor-pointer"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
