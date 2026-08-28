import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { Topbar } from '@/components/navigation/Topbar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { ExpenseModal, SettleModal, ReceiptDrawer } from '@/features/expenses';
import { InviteModal } from '@/features/roommates';

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
