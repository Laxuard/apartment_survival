import React, { useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  IconSearch,
  IconBell,
  IconBellOff,
  IconUserPlus,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { usePantryStock, type PantryItem } from '@/features/pantry';
import { useHouseholdLedger } from '@/features/roommates';
import { useBillsSummary } from '@/features/bills';
import { useExpensesQuery } from '@/features/expenses';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

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
  const currentUser = useAuthStore((s) => s.user);

  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);

  // Unified domain hooks for live dynamic notifications
  const pantryStock = usePantryStock();
  const ledger = useHouseholdLedger();
  const billsSummary = useBillsSummary();
  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);

  const userInitial = (currentUser?.name || 'User').charAt(0).toUpperCase();

  // Aggregate live smart notifications if not passed in props
  const notifications = useMemo(() => {
    if (propNotifs) return propNotifs;

    const list: Array<{ id: string; title: string; subtitle: string; type: 'warn' | 'sage' | 'oak' }> = [];

    // Critical pantry items
    if (pantryStock.criticalCount > 0) {
      list.push({
        id: 'notif-pantry',
        title: `${pantryStock.criticalCount} pantry items running low`,
        subtitle: `${pantryStock.criticalItems.map((i: PantryItem) => i.name).slice(0, 2).join(', ')}${pantryStock.criticalCount > 2 ? '...' : ''} need restocking.`,
        type: 'warn',
      });
    }

    // Overdue peer roommate debts (automatically excluded current user)
    const overdueRoommates = ledger.overduePeers;
    if (overdueRoommates.length > 0) {
      list.push({
        id: 'notif-debt',
        title: `${overdueRoommates[0].name} has an overdue tab`,
        subtitle: `Balance of ${overdueRoommates[0].balance.toFixed(2)} ${ledger.currency} (${overdueRoommates[0].overdueDays}d overdue).`,
        type: 'oak',
      });
    }

    // Urgent bills
    if (billsSummary.urgentCount > 0) {
      const urgentBill = billsSummary.urgentBills[0];
      list.push({
        id: 'notif-bill',
        title: `Bill due soon: ${urgentBill.title}`,
        subtitle: `${urgentBill.amount.toFixed(2)} ${billsSummary.currency} (${urgentBill.dueText}).`,
        type: 'warn',
      });
    }

    // Recent expense logged
    if (expenses.length > 0) {
      list.push({
        id: 'notif-expense',
        title: `Recent expense logged`,
        subtitle: `${expenses[0].description} (${expenses[0].amount.toFixed(2)} ${ledger.currency}) by ${expenses[0].payerName}.`,
        type: 'sage',
      });
    }

    return list;
  }, [propNotifs, pantryStock.criticalCount, pantryStock.criticalItems, ledger.overduePeers, ledger.currency, billsSummary.urgentCount, billsSummary.urgentBills, billsSummary.currency, expenses]);

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
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Search anything or jump to tabs (⌘K / Ctrl+K)</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Modern Squircle Member Presence Stack & Alert Bell */}
      <div className="topbar-right flex items-center gap-3 shrink-0" ref={notifRef}>
        {/* Sleek Presence Avatar Stack */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center -space-x-1.5">
            {/* Current User */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--oak)] to-[#D07B30] text-white font-bold text-xs flex items-center justify-center ring-2 ring-[var(--card)] shadow-xs hover:scale-110 hover:z-20 transition-all duration-150 cursor-pointer">
                  {userInitial}
                </div>
              </TooltipTrigger>
              <TooltipContent>{currentUser?.name || 'User'} (You · Admin)</TooltipContent>
            </Tooltip>

            {/* Flatmate Peers */}
            {ledger.peers.map((rm) => (
              <Tooltip key={rm.id}>
                <TooltipTrigger asChild>
                  <div
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center ring-2 ring-[var(--card)] shadow-xs hover:scale-110 hover:z-20 transition-all duration-150 cursor-pointer ${
                      rm.avatarColor === 'oak'
                        ? 'bg-gradient-to-br from-[#D98236] to-[#B86822] text-white'
                        : 'bg-gradient-to-br from-[var(--sage)] to-[#7AA06D] text-white'
                    }`}
                  >
                    {rm.avatarInitial}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  {rm.name} · {rm.balance >= 0 ? `Owes you +${rm.balance.toFixed(2)} ${ledger.currency}` : `You owe ${Math.abs(rm.balance).toFixed(2)} ${ledger.currency}`}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Quick Invite Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => openModal('invite')}
                className="w-8 h-8 rounded-xl bg-[var(--canvas)] border border-dashed border-[var(--border-strong)] hover:border-[var(--oak)] hover:bg-[var(--oak-tint)] text-[var(--muted)] hover:text-[var(--oak)] flex items-center justify-center cursor-pointer transition-all shadow-2xs"
                aria-label="Invite flatmate"
              >
                <IconUserPlus size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Invite new flatmate</TooltipContent>
          </Tooltip>
        </div>

        {/* Notifications bell */}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            {notifications.length > 0 ? `${notifications.length} unread household alerts` : 'No unread alerts'}
          </TooltipContent>
        </Tooltip>

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
