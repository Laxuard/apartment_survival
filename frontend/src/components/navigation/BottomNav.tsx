import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconLayoutDashboard,
  IconReceipt2,
  IconPlus,
  IconShoppingCart,
  IconUser,
} from '@tabler/icons-react';
import { useUIStore } from '@/stores/useUIStore';

export const BottomNav: React.FC = () => {
  const { openModal } = useUIStore();

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <NavLink
        to="/"
        end
        className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
      >
        <IconLayoutDashboard size={20} aria-hidden="true" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/expenses"
        className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
      >
        <IconReceipt2 size={20} aria-hidden="true" />
        <span>Ledger</span>
      </NavLink>

      {/* Center Floating Action Button to Log Expense */}
      <button
        type="button"
        className="fab"
        aria-label="Log expense"
        onClick={() => openModal('expense')}
      >
        <IconPlus size={24} aria-hidden="true" />
      </button>

      <NavLink
        to="/pantry"
        className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
      >
        <IconShoppingCart size={20} aria-hidden="true" />
        <span>Pantry</span>
      </NavLink>

      <NavLink
        to="/settings"
        className={({ isActive }) => `bn-item ${isActive ? 'active' : ''}`}
      >
        <IconUser size={20} aria-hidden="true" />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};
