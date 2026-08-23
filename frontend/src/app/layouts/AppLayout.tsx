import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { ExpenseModal } from '@/features/expenses/components/ExpenseModal';
import { SettleModal } from '@/features/expenses/components/SettleModal';
import { InviteModal } from '@/features/roommates/components/InviteModal';
import { ReceiptDrawer } from '@/features/expenses/components/ReceiptDrawer';

export const AppLayout: React.FC = () => {
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
      <CommandPalette />
      <ReceiptDrawer />
    </>
  );
};
