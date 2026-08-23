import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  IconHome,
  IconLayoutDashboard,
  IconReceipt2,
  IconShoppingCart,
  IconUsers,
  IconSettings,
  IconChevronDown,
  IconPlus,
  IconUserPlus,
  IconCheck,
} from '@tabler/icons-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useThemeStore } from '@/stores/useThemeStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';

interface NavItemConfig {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { to: '/', label: 'Dashboard', icon: IconLayoutDashboard },
  { to: '/expenses', label: 'Expenses and ledger', icon: IconReceipt2 },
  { to: '/pantry', label: 'Pantry and stock', icon: IconShoppingCart },
  { to: '/roommates', label: 'Roommates and invites', icon: IconUsers },
  { to: '/settings', label: 'Settings', icon: IconSettings },
];

export const Sidebar: React.FC = () => {
  const { mode, toggleMode } = useThemeStore();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  const { households, activeHouseholdId, setActiveHousehold, getActiveHousehold } =
    useHouseholdStore();
  const activeHousehold = getActiveHousehold();

  return (
    <aside className="sidebar">
      {/* Apartment Switcher Dropdown */}
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2.5 p-2.5 w-full text-left rounded-xl border border-[var(--border)] bg-[var(--canvas)] hover:bg-[var(--sage-tint)] transition-all cursor-pointer select-none"
            aria-label="Switch apartment"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center shrink-0">
              <IconHome size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-[var(--text)] leading-tight">
                {activeHousehold?.name || 'Select Flat'}
              </div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                {activeHousehold?.role === 'ADMIN' ? 'Admin view' : 'Member view'}
              </div>
            </div>
            <IconChevronDown size={14} className="text-[var(--muted)] shrink-0" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[260px] p-2 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl space-y-1"
          >
            <div className="px-2.5 py-1.5 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">
              Your Apartments
            </div>

            {households.map((h) => {
              const isCurrent = h.id === activeHouseholdId;
              return (
                <DropdownMenuItem
                  key={h.id}
                  onClick={() => setActiveHousehold(h.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isCurrent
                      ? 'bg-[var(--oak-tint)] text-[var(--oak-hover)] dark:text-[var(--oak)]'
                      : 'hover:bg-[var(--sage-tint)] text-[var(--text)]'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--card)] border border-[var(--border)] text-[var(--oak)] flex items-center justify-center font-bold text-xs shrink-0">
                    <IconHome size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{h.name}</div>
                    <div className="text-[11px] text-[var(--muted)]">
                      {h.memberCount || 3} members · {h.role === 'ADMIN' ? 'Admin' : 'Member'}
                    </div>
                  </div>
                  {isCurrent && <IconCheck size={16} className="text-[var(--oak)] shrink-0" />}
                </DropdownMenuItem>
              );
            })}

            <DropdownMenuSeparator className="my-1.5 bg-[var(--border)]" />

            <DropdownMenuItem
              onClick={() => navigate('/onboarding/create')}
              className="flex items-center gap-2.5 p-2 rounded-xl text-[13px] font-medium text-[var(--oak)] hover:bg-[var(--oak-tint)] cursor-pointer transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-[var(--oak-tint)] flex items-center justify-center shrink-0">
                <IconPlus size={14} />
              </div>
              <span>Create new apartment</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate('/onboarding/join')}
              className="flex items-center gap-2.5 p-2 rounded-xl text-[13px] font-medium text-[var(--sage)] hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
            >
              <div className="w-6 h-6 rounded-md bg-[var(--sage-tint)] flex items-center justify-center shrink-0">
                <IconUserPlus size={14} />
              </div>
              <span>Join with invite code</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="primary-nav" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Theme & Profile */}
      <div className="sidebar-bottom">
        <div className="toggle-row">
          <span id="dark-mode-label">Dark mode</span>
          <button
            className="switch"
            id="modeSwitch"
            role="switch"
            aria-checked={isDark}
            aria-labelledby="dark-mode-label"
            onClick={toggleMode}
            type="button"
          >
            <span className="knob" />
          </button>
        </div>

        <button
          className="profile-row"
          type="button"
          aria-label="User profile"
          onClick={() => navigate('/settings')}
        >
          <span className="avatar oak">L</span>
          <span>Laxuard</span>
        </button>
      </div>
    </aside>
  );
};
