import React from 'react';
import { Outlet } from 'react-router-dom';
import { IconHome } from '@tabler/icons-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--canvas)]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--oak-tint)] text-[var(--oak)] mb-2 shadow-sm">
            <IconHome size={26} />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[var(--text)]">
            Apartment Survival
          </h1>
          <p className="text-xs text-[var(--muted)]">
            Shared expense ledger, pantry stock & roommate settlements
          </p>
        </div>

        <div className="card-custom shadow-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
