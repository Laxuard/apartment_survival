import React from 'react';
import { IconKeyboard, IconX } from '@tabler/icons-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  {
    group: 'Navigation',
    items: [
      { keys: ['⌘', 'K'], desc: 'Open Command Palette & Global Search' },
      { keys: ['1'], desc: 'Jump to Dashboard Overview' },
      { keys: ['2'], desc: 'Jump to Expenses & Ledger' },
      { keys: ['3'], desc: 'Jump to Pantry & Stock' },
      { keys: ['4'], desc: 'Jump to Roommates & Debts' },
      { keys: ['5'], desc: 'Jump to Space Settings' },
    ],
  },
  {
    group: 'Quick Actions',
    items: [
      { keys: ['N'], desc: 'Log a new shared expense' },
      { keys: ['B'], desc: 'Set up a recurring bill template' },
      { keys: ['S'], desc: 'Open quick settlement modal' },
      { keys: ['I'], desc: 'Open roommate invite modal' },
      { keys: ['?'], desc: 'Toggle keyboard shortcuts cheat sheet' },
      { keys: ['ESC'], desc: 'Close any active modal or drawer' },
    ],
  },

];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false} className="max-w-md p-6 space-y-4 rounded-3xl">
        <DialogHeader className="mb-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center font-bold shadow-xs">
                <IconKeyboard size={19} />
              </div>
              <div>
                <DialogTitle className="text-base font-serif font-bold text-[var(--text)]">
                  Keyboard Shortcuts
                </DialogTitle>
                <p className="text-[11px] text-[var(--muted)]">Power user navigation & hotkeys</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl border border-[var(--border)] hover:bg-[var(--canvas)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors cursor-pointer"
            >
              <IconX size={15} />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {SHORTCUTS.map((section) => (
            <div key={section.group} className="space-y-2">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)] px-1">
                {section.group}
              </div>
              <div className="space-y-1.5">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-2xl bg-[var(--canvas)]/70 border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--canvas)] transition-all text-xs"
                  >
                    <span className="text-[var(--text)] font-medium text-[12px]">{item.desc}</span>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      {item.keys.map((k, ki) => (
                        <kbd
                          key={ki}
                          className="min-w-[22px] h-6 px-2 rounded-lg bg-[var(--card)] border border-[var(--border-strong)] text-[11px] font-mono font-bold text-[var(--text)] flex items-center justify-center shadow-[0_1px_2px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.06)]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted)]">
          <span>Tip: Press <strong className="text-[var(--text)] font-mono">?</strong> anywhere to toggle</span>
          <span className="text-[10px] bg-[var(--canvas)] px-2 py-0.5 rounded-md border border-[var(--border)] font-mono">
            Apartment OS
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
