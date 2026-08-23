import React from 'react';
import { useThemeStore } from '@/stores/useThemeStore';

export const SettingsPage: React.FC = () => {
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-[var(--text)]">Settings</h1>
        <p className="text-xs text-[var(--muted)] mt-1">
          Customize your apartment preferences, display theme, and currency settings.
        </p>
      </div>

      <div className="card-custom space-y-4">
        <div className="card-head border-b border-[var(--border)] pb-3">
          <h2 className="card-title-custom">Appearance</h2>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-[var(--text)]">Dark Theme</div>
            <div className="text-xs text-[var(--muted)]">Toggle between light and dark display modes</div>
          </div>
          <button
            className="switch"
            role="switch"
            aria-checked={isDark}
            onClick={toggleMode}
            type="button"
          >
            <span className="knob" />
          </button>
        </div>
      </div>

      <div className="card-custom space-y-4">
        <div className="card-head border-b border-[var(--border)] pb-3">
          <h2 className="card-title-custom">Apartment Information</h2>
        </div>

        <div className="space-y-3 text-xs text-[var(--muted)]">
          <div className="flex justify-between py-1">
            <span>Apartment Name</span>
            <span className="font-medium text-[var(--text)]">Apartment 4B</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Primary Currency</span>
            <span className="font-medium text-[var(--text)]">MAD (Moroccan Dirham)</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Split Algorithm</span>
            <span className="font-medium text-[var(--text)]">Minimum Cash Flow (Debt Simplification)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
