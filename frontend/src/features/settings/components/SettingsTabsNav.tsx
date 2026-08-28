import React, { useRef, useState, useLayoutEffect } from 'react';
import { SETTINGS_TABS } from '../constants/settings.constants';
import type { SettingsTab } from '../types/settings.types';

interface SettingsTabsNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  householdName?: string;
  saveStatus: 'saved' | 'saving';
}

export const SettingsTabsNav: React.FC<SettingsTabsNavProps> = ({
  activeTab,
  onTabChange,
  householdName,
  saveStatus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<Record<string, HTMLButtonElement | null>>({});

  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useLayoutEffect(() => {
    const activeEl = tabsRef.current[activeTab];
    if (activeEl && containerRef.current) {
      setIndicatorStyle({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        opacity: 1,
      });
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xs">
      <div ref={containerRef} className="relative flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {/* Smooth Animated Sliding Indicator Pill */}
        <div
          className="absolute top-0 bottom-0 rounded-xl bg-[var(--canvas)] border border-[var(--border-strong)] shadow-xs transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
          style={{
            transform: `translateX(${indicatorStyle.left}px)`,
            width: `${indicatorStyle.width}px`,
            opacity: indicatorStyle.opacity,
          }}
        />

        {SETTINGS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabsRef.current[tab.id] = el;
              }}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors duration-200 cursor-pointer whitespace-nowrap select-none ${
                isActive
                  ? 'text-[var(--oak)] font-bold'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.id === 'household' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-[var(--oak-tint)] text-[var(--oak)] font-bold">
                  {householdName || 'Apt 4B'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ambient Live Auto-Save Status */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs text-[var(--muted)] font-medium">
        <span
          className={`w-2 h-2 rounded-full transition-colors ${
            saveStatus === 'saving' ? 'bg-[var(--warn-text)] animate-pulse' : 'bg-[var(--sage)]'
          }`}
        />
        <span>{saveStatus === 'saving' ? 'Saving changes...' : 'Synced to cloud'}</span>
      </div>
    </div>
  );
};
