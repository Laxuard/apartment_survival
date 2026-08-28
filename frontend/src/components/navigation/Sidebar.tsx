import React, { useState } from 'react';
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
  IconBuildingCommunity,
  IconLogout,
} from '@tabler/icons-react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePantryItemsQuery } from '@/features/pantry';
import { useRoommatesQuery } from '@/features/roommates';
import { useQueryClient } from '@tanstack/react-query';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isHouseholdExpanded, setIsHouseholdExpanded] = useState(false);

  const { user, logout } = useAuthStore();
  const { households, activeHouseholdId, setActiveHousehold, getActiveHousehold } =
    useHouseholdStore();
  const activeHousehold = getActiveHousehold();

  // Dynamic feature queries
  const { data: pantryItems = [] } = usePantryItemsQuery(activeHouseholdId);
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId);

  // Dynamic calculations
  const lowPantryCount = pantryItems.filter((i) => i.status === 'low' || i.status === 'out').length;
  const userNetBalance = roommates.reduce((acc, curr) => acc + curr.balance, 0);
  const memberCount = roommates.length || activeHousehold?.memberCount || 0;

  const navItems = [
    { to: '/', label: 'Dashboard', icon: IconLayoutDashboard },
    {
      to: '/expenses',
      label: 'Ledger & Expenses',
      icon: IconReceipt2,
      badge:
        userNetBalance !== 0
          ? {
              text: `${userNetBalance > 0 ? '+' : ''}${Math.round(userNetBalance)}`,
              variant: userNetBalance >= 0 ? ('sage' as const) : ('warn' as const),
            }
          : undefined,
    },
    {
      to: '/pantry',
      label: 'Pantry & Stock',
      icon: IconShoppingCart,
      badge:
        lowPantryCount > 0
          ? { text: `${lowPantryCount} low`, variant: 'warn' as const }
          : undefined,
    },
    {
      to: '/roommates',
      label: 'Roommates',
      icon: IconUsers,
      badge: memberCount > 0 ? { text: `${memberCount}`, variant: 'neutral' as const } : undefined,
    },
    { to: '/settings', label: 'Settings', icon: IconSettings },
  ];

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const userName = user?.name || 'User';
  const userEmail = user?.email || 'user@apartment.com';

  const handleSignOut = () => {
    logout();
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  const handleSelectHousehold = (householdId: string) => {
    setActiveHousehold(householdId);
    setIsHouseholdExpanded(false);
  };

  return (
    <aside className="sidebar flex flex-col justify-between select-none">
      {/* Top Section: Household Expanding Manager & Navigation */}
      <div className="space-y-3">
        {/* Household Expanding Card */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--canvas)] p-1.5 shadow-2xs transition-all">
          <button
            type="button"
            onClick={() => setIsHouseholdExpanded((prev) => !prev)}
            className="flex items-center justify-between p-2 w-full text-left rounded-xl hover:bg-[var(--sage-tint)] transition-all cursor-pointer group select-none"
            aria-expanded={isHouseholdExpanded}
            aria-label="Toggle household switch menu"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[var(--oak)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                <IconBuildingCommunity size={17} />
              </div>
              <div className="min-w-0">
                <div className="font-serif font-bold text-sm text-[var(--text)] truncate leading-tight">
                  {activeHousehold?.name || 'Apartment 4B'}
                </div>
                <div className="text-[11px] text-[var(--muted)] truncate flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--sage)] shrink-0" />
                  <span>
                    {activeHousehold?.role === 'ADMIN' ? 'Admin' : 'Member'} · {memberCount} flatmates
                  </span>
                </div>
              </div>
            </div>
            <IconChevronDown
              size={15}
              className={`text-[var(--muted)] group-hover:text-[var(--text)] shrink-0 transition-transform duration-300 ease-out ${
                isHouseholdExpanded ? 'rotate-180 text-[var(--oak)]' : ''
              }`}
            />
          </button>

          {/* Smooth Expanding Accordion Drawer */}
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              isHouseholdExpanded
                ? 'grid-rows-[1fr] opacity-100 mt-2 border-t border-[var(--border)] pt-2'
                : 'grid-rows-[0fr] opacity-0 pointer-events-none'
            }`}
          >
            <div className="overflow-hidden space-y-1">
              <div className="px-2 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                Your Households
              </div>

              {households.map((h) => {
                const isCurrent = h.id === activeHouseholdId;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => handleSelectHousehold(h.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[var(--oak-tint)] text-[var(--oak-hover)] dark:text-[var(--oak)] font-semibold shadow-2xs'
                        : 'hover:bg-[var(--card)] text-[var(--text)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconHome
                        size={14}
                        className={isCurrent ? 'text-[var(--oak)]' : 'text-[var(--muted)]'}
                      />
                      <span className="truncate">{h.name}</span>
                    </div>
                    {isCurrent && <IconCheck size={14} className="text-[var(--oak)] shrink-0" />}
                  </button>
                );
              })}

              <div className="border-t border-[var(--border)] pt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsHouseholdExpanded(false);
                    navigate('/onboarding/create');
                  }}
                  className="w-full flex items-center gap-2 p-1.5 rounded-xl text-[11px] font-medium text-[var(--oak)] hover:bg-[var(--oak-tint)] cursor-pointer transition-colors"
                >
                  <IconPlus size={13} />
                  <span>Create new apartment...</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsHouseholdExpanded(false);
                    navigate('/onboarding/join');
                  }}
                  className="w-full flex items-center gap-2 p-1.5 rounded-xl text-[11px] font-medium text-[var(--sage)] hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
                >
                  <IconUserPlus size={13} />
                  <span>Join with invite code</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Nav List (Smoothly pushed down) */}
        <nav className="primary-nav space-y-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-item flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[var(--oak-tint)] text-[var(--oak-hover)] dark:text-[var(--oak)] font-semibold shadow-xs'
                      : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--sage-tint)]'
                  }`
                }
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon size={17} aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tight shrink-0 ${
                      item.badge.variant === 'sage'
                        ? 'bg-[var(--positive-bg)] text-[var(--positive-text)]'
                        : item.badge.variant === 'warn'
                        ? 'bg-[var(--warn-bg)] text-[var(--warn-text)]'
                        : 'bg-[var(--canvas)] text-[var(--muted)] border border-[var(--border)]'
                    }`}
                  >
                    {item.badge.text}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Harmonized Profile Card & Reddish Logout */}
      <div className="sidebar-bottom pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
        {/* Matching Typography & Visual Weight Profile Card */}
        <div
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2.5 min-w-0 flex-1 p-2 rounded-2xl bg-[var(--canvas)] hover:bg-[var(--sage-tint)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-all cursor-pointer text-left shadow-2xs group"
          title="Go to Settings"
        >
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-xl bg-[var(--oak)] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
              {userInitial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--sage)] ring-2 ring-[var(--canvas)]" />
          </div>
          <div className="truncate min-w-0">
            <div className="font-serif font-bold text-sm text-[var(--text)] truncate leading-tight group-hover:text-[var(--oak)] transition-colors">
              {userName}
            </div>
            <div className="text-[11px] text-[var(--muted)] truncate mt-0.5">{userEmail}</div>
          </div>
        </div>

        {/* Proportional Reddish Logout Button */}
        <button
          type="button"
          onClick={handleSignOut}
          className="h-10 w-10 rounded-xl border border-[var(--negative-text)]/35 bg-[var(--negative-bg)] text-[var(--negative-text)] hover:bg-[var(--negative-text)] hover:text-white transition-all cursor-pointer shadow-xs shrink-0 flex items-center justify-center group"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <IconLogout size={17} className="group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </aside>
  );
};
