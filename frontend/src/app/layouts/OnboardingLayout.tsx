import { useAuthStore } from '@/stores/useAuthStore';
import { IconHome, IconLogout } from '@tabler/icons-react';
import React from 'react';
import { Outlet } from 'react-router-dom';

export const OnboardingLayout: React.FC = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--canvas)]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--oak-tint)] text-[var(--oak)] flex items-center justify-center">
            <IconHome size={18} />
          </div>
          <span className="font-serif font-semibold text-sm">Apartment Survival</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--muted)]">Signed in as {user?.name || 'User'}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="bell-btn text-[var(--muted)] hover:text-[var(--text)]"
            title="Sign out"
          >
            <IconLogout size={16} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
