import React from 'react';
import {
  IconSun,
  IconMoon,
  IconDeviceDesktop,
  IconCheck,
} from '@tabler/icons-react';

interface AppearanceSettingsTabProps {
  mode: 'light' | 'dark' | 'system';
  onModeChange: (mode: 'light' | 'dark' | 'system') => void;
}

export const AppearanceSettingsTab: React.FC<AppearanceSettingsTabProps> = ({
  mode,
  onModeChange,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="card-custom overflow-hidden">
        <div className="card-head">
          <div>
            <h3 className="card-title-custom">Interface Theme</h3>
            <div className="card-title-sub">Select your visual contrast and color temperature</div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Light Mode */}
            <button
              type="button"
              onClick={() => onModeChange('light')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer ${
                mode === 'light'
                  ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/25 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--oak)]/15 text-[var(--oak)] flex items-center justify-center">
                  <IconSun size={18} />
                </div>
                {mode === 'light' && <IconCheck size={16} className="text-[var(--oak)] font-bold" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text)]">Terracotta & Linen</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Warm daylight aesthetic</div>
              </div>
            </button>

            {/* Dark Mode */}
            <button
              type="button"
              onClick={() => onModeChange('dark')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer ${
                mode === 'dark'
                  ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/25 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--oak)]/15 text-[var(--oak)] flex items-center justify-center">
                  <IconMoon size={18} />
                </div>
                {mode === 'dark' && <IconCheck size={16} className="text-[var(--oak)] font-bold" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text)]">Espresso & Oak</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Deep contrast dark theme</div>
              </div>
            </button>

            {/* System Mode */}
            <button
              type="button"
              onClick={() => onModeChange('system')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all cursor-pointer ${
                mode === 'system'
                  ? 'border-[var(--oak)] bg-[var(--canvas)] ring-2 ring-[var(--oak)]/25 shadow-sm'
                  : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[var(--card)] text-[var(--muted)] flex items-center justify-center border border-[var(--border)]">
                  <IconDeviceDesktop size={18} />
                </div>
                {mode === 'system' && <IconCheck size={16} className="text-[var(--oak)] font-bold" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--text)]">System Default</div>
                <div className="text-[11px] text-[var(--muted)] mt-0.5">Matches OS settings</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

