import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IconSearch,
  IconPlus,
  IconBell,
  IconBellOff,
  IconUserPlus,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { usePantryItemsQuery } from '@/features/pantry';
import { useRoommatesQuery } from '@/features/roommates';
import { useBillsQuery } from '@/features/bills';
import { useExpensesQuery } from '@/features/expenses';

interface TopbarProps {
  notifications?: Array<{
    id: string;
    title: string;
    subtitle: string;
    type: 'warn' | 'sage' | 'oak';
  }>;
}

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Overview & Ledger' },
  '/expenses': { title: 'Ledger & Expenses', subtitle: 'Household spending & split history' },
  '/pantry': { title: 'Pantry & Stock', subtitle: 'Supplies, restock levels & grocery list' },
  '/roommates': { title: 'Roommates & Debts', subtitle: 'Flatmate balances & settlements' },
  '/settings': { title: 'Settings', subtitle: 'Preferences, algorithm & household parameters' },
};

export const Topbar: React.FC<TopbarProps> = ({ notifications: propNotifs }) => {
  const location = useLocation();
  const notifRef = useRef<HTMLDivElement>(null);
  const { isNotifOpen, toggleNotif, togglePalette, closeAllPopovers, openModal } = useUIStore();

  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { getActiveCurrency } = useHouseholdStore();
  const currency = getActiveCurrency();

  // Queries for live dynamic notifications
  const { data: pantryItems = [] } = usePantryItemsQuery(activeHouseholdId);
  const { data: roommates = [] } = useRoommatesQuery(activeHouseholdId, currency);
  const { data: bills = [] } = useBillsQuery(activeHouseholdId);
  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);

  // Aggregate live smart notifications if not passed in props
  const notifications = useMemo(() => {
    if (propNotifs) return propNotifs;

    const list: Array<{ id: string; title: string; subtitle: string; type: 'warn' | 'sage' | 'oak' }> = [];

    // Critical pantry items
    const lowItems = pantryItems.filter((i) => i.status === 'out' || i.status === 'low');
    if (lowItems.length > 0) {
      list.push({
        id: 'notif-pantry',
        title: `${lowItems.length} pantry items running low`,
        subtitle: `${lowItems.map((i) => i.name).slice(0, 2).join(', ')}${lowItems.length > 2 ? '...' : ''} need restocking.`,
        type: 'warn',
      });
    }

    // Overdue roommate debts
    const overdueRoommates = roommates.filter((r) => r.overdueDays && r.overdueDays > 0);
    if (overdueRoommates.length > 0) {
      list.push({
        id: 'notif-debt',
        title: `${overdueRoommates[0].name} has an overdue tab`,
        subtitle: `Balance of ${overdueRoommates[0].balance.toFixed(2)} ${currency} (${overdueRoommates[0].overdueDays}d overdue).`,
        type: 'oak',
      });
    }

    // Urgent bills
    const urgentBills = bills.filter(
      (b) =>
        b.dueText.toLowerCase().includes('tomorrow') ||
        b.dueText.toLowerCase().includes('3 days') ||
        (b.dueDays && b.dueDays <= 3)
    );
    if (urgentBills.length > 0) {
      list.push({
        id: 'notif-bill',
        title: `Bill due soon: ${urgentBills[0].title}`,
        subtitle: `${urgentBills[0].amount.toFixed(2)} ${currency} (${urgentBills[0].dueText}).`,
        type: 'warn',
      });
    }

    // Recent expense logged
    if (expenses.length > 0) {
      list.push({
        id: 'notif-expense',
        title: `Recent expense logged`,
        subtitle: `${expenses[0].description} (${expenses[0].amount.toFixed(2)} ${currency}) by ${expenses[0].payerName}.`,
        type: 'sage',
      });
    }

    return list;
  }, [propNotifs, pantryItems, roommates, bills, expenses, currency]);

  const routeInfo = ROUTE_TITLES[location.pathname] || {
    title: 'Apartment Survival',
    subtitle: 'Shared Living',
  };

  // Global Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        togglePalette();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePalette]);

  // Click outside to close notification panel
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        closeAllPopovers();
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isNotifOpen, closeAllPopovers]);

  return (
    <header className="topbar select-none backdrop-blur-md bg-[var(--card)]/90 relative flex items-center justify-between px-6 border-b border-[var(--border)]">
      {/* Left: View Title & Subtitle with fixed width slot to prevent center shifting */}
      <div className="flex items-center gap-3 min-w-0 w-48 sm:w-64 shrink-0">
        <div className="truncate">
          <h1 className="font-serif text-sm sm:text-base font-bold text-[var(--text)] leading-tight truncate">
            {routeInfo.title}
          </h1>
          <p className="text-[10px] sm:text-[10.5px] text-[var(--muted)] truncate font-medium mt-0.5">
            {routeInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Search / Command Palette (Absolute Centered so it NEVER moves across routes) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 max-w-sm w-full px-4">
        <button
          type="button"
          className="search-trigger flex items-center justify-between w-full px-3 py-1.5 rounded-xl bg-[var(--canvas)] border border-[var(--border)] text-[var(--muted)] hover:border-[var(--oak)] transition-colors cursor-pointer shadow-2xs text-xs"
          onClick={() => togglePalette(true)}
          aria-haspopup="dialog"
        >
          <div className="flex items-center gap-2 truncate">
            <IconSearch size={14} aria-hidden="true" className="text-[var(--muted)] shrink-0" />
            <span className="truncate">Quick search transactions, pantry, flatmates...</span>
          </div>
          <kbd className="text-[10px] bg-[var(--border)] px-1.5 py-0.5 rounded font-mono shrink-0 ml-2">⌘K</kbd>
        </button>
      </div>

      {/* Right: Context Actions & Alert Bell */}
      <div className="topbar-right flex items-center gap-2 shrink-0" ref={notifRef}>
        {/* Quick Log Expense CTA */}
        <button
          type="button"
          onClick={() => openModal('expense')}
          className="btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--oak)] text-white text-xs font-semibold hover:bg-[var(--oak-hover)] cursor-pointer shadow-xs transition-all"
        >
          <IconPlus size={14} />
          <span className="hidden sm:inline">Log Expense</span>
        </button>

        {/* Invite roommate action */}
        <button
          type="button"
          className="btn-outline hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--sage-tint)] cursor-pointer transition-colors"
          onClick={() => openModal('invite')}
        >
          <IconUserPlus size={14} aria-hidden="true" />
          <span>Invite</span>
        </button>

        {/* Notifications bell */}
        <button
          type="button"
          className="bell-btn cursor-pointer relative p-2 rounded-xl hover:bg-[var(--sage-tint)] text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          aria-haspopup="true"
          aria-expanded={isNotifOpen}
          aria-label={`Notifications, ${notifications.length} alerts`}
          onClick={(e) => {
            e.stopPropagation();
            toggleNotif();
          }}
        >
          <IconBell size={18} aria-hidden="true" />
          {notifications.length > 0 && <span className="dot pulse-subtle" aria-hidden="true" />}
        </button>

        {/* Notification Popover Panel */}
        {isNotifOpen && (
          <div
            className="notif-panel shadow-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] w-80 p-2 space-y-1 z-50 animate-fade-in absolute right-4 top-14"
            role="menu"
          >
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--border)] text-xs">
              <span className="font-bold text-[var(--text)]">Live Alerts ({notifications.length})</span>
              <span
                onClick={closeAllPopovers}
                className="text-[10px] text-[var(--oak)] font-medium cursor-pointer hover:underline"
              >
                Dismiss
              </span>
            </div>

            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-[var(--muted)] space-y-1">
                <IconBellOff size={20} className="mx-auto text-[var(--muted)]" />
                <div>All caught up! No active alerts.</div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="notif-item p-2 rounded-xl hover:bg-[var(--canvas)] transition-colors cursor-pointer space-y-0.5"
                >
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        notif.type === 'warn'
                          ? 'bg-[var(--negative-text)]'
                          : notif.type === 'sage'
                          ? 'bg-[var(--sage)]'
                          : 'bg-[var(--oak)]'
                      }`}
                    />
                    <span className="font-semibold text-xs text-[var(--text)]">
                      {notif.title}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--muted)] pl-3">
                    {notif.subtitle}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </header>
  );
};
