import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconReceipt2,
  IconShoppingCart,
  IconUsers,
  IconSettings,
  IconPlus,
  IconArrowsExchange,
  IconUserPlus,
  IconSearch,
} from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { useUIStore } from '@/stores/useUIStore';

interface PaletteItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC = () => {
  const { isPaletteOpen, togglePalette, openModal, openSettleModal } = useUIStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const items: PaletteItem[] = [
    {
      id: 'dash',
      label: 'Dashboard',
      icon: IconLayoutDashboard,
      action: () => {
        navigate('/');
        togglePalette(false);
      },
    },
    {
      id: 'expenses',
      label: 'Expenses and ledger',
      icon: IconReceipt2,
      action: () => {
        navigate('/expenses');
        togglePalette(false);
      },
    },
    {
      id: 'pantry',
      label: 'Pantry and stock',
      icon: IconShoppingCart,
      action: () => {
        navigate('/pantry');
        togglePalette(false);
      },
    },
    {
      id: 'roommates',
      label: 'Roommates and invites',
      icon: IconUsers,
      action: () => {
        navigate('/roommates');
        togglePalette(false);
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: IconSettings,
      action: () => {
        navigate('/settings');
        togglePalette(false);
      },
    },
    {
      id: 'action-exp',
      label: 'Log expense',
      icon: IconPlus,
      action: () => {
        togglePalette(false);
        openModal('expense');
      },
    },
    {
      id: 'action-settle',
      label: 'Record Payment (Settle Tab)',
      icon: IconArrowsExchange,
      action: () => {
        togglePalette(false);
        openSettleModal();
      },
    },
    {
      id: 'action-invite',
      label: 'Invite roommate',
      icon: IconUserPlus,
      action: () => {
        togglePalette(false);
        openModal('invite');
      },
    },
  ];

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={isPaletteOpen} onOpenChange={(open) => togglePalette(open)}>
      <DialogContent className="p-0 max-w-[480px] overflow-hidden bg-[var(--card)] border-[var(--border)] top-[20%] translate-y-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border)]">
          <IconSearch size={18} className="text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search pages and actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-[14px] text-[var(--text)] placeholder-[var(--muted)]"
            autoFocus
          />
        </div>

        <div className="p-2 max-h-[260px] overflow-y-auto space-y-1">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-[13.5px] text-[var(--text)] hover:bg-[var(--oak-tint)] transition-colors cursor-pointer"
                >
                  <Icon size={16} className="text-[var(--muted)]" />
                  <span>{item.label}</span>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-[var(--muted)]">No results found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
