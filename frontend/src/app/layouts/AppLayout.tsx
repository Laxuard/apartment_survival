import { BottomNav } from '@/components/navigation/BottomNav';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { KeyboardShortcutsModal } from '@/components/navigation/KeyboardShortcutsModal';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { ExpenseModal, ReceiptDrawer, SettleModal } from '@/features/expenses';
import { InviteModal } from '@/features/roommates';
import { CreateBillModal, MarkBillPaidModal, ManageBillsModal } from '@/features/bills';
import { useUIStore } from '@/stores/useUIStore';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { openModal, openSettleModal, openBillModal } = useUIStore();
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keystrokes when typing in inputs, textareas, or contentEditable elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Don't fire if Ctrl / Cmd / Alt is pressed (except ? which might require Shift)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault();
          openModal('expense');
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          openBillModal();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          openSettleModal();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          openModal('invite');
          break;
        case '?':
          e.preventDefault();
          setIsShortcutsOpen((prev) => !prev);
          break;
        case '1':
          e.preventDefault();
          navigate('/dashboard');
          break;
        case '2':
          e.preventDefault();
          navigate('/expenses');
          break;
        case '3':
          e.preventDefault();
          navigate('/pantry');
          break;
        case '4':
          e.preventDefault();
          navigate('/roommates');
          break;
        case '5':
          e.preventDefault();
          navigate('/settings');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, openModal, openSettleModal, openBillModal]);

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div className="app">
        <Sidebar />

        <div className="main">
          <Topbar />
          <main className="content" id="main-content">
            <Outlet />
          </main>
          <BottomNav />
        </div>
      </div>

      {/* Global Modals & Drawers */}
      <ExpenseModal />
      <SettleModal />
      <InviteModal />
      <CreateBillModal />
      <MarkBillPaidModal />
      <ManageBillsModal />
      <CommandPalette />
      <ReceiptDrawer />
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </>
  );
};
