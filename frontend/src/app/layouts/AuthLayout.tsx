import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { IconBuildingCommunity } from '@tabler/icons-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[var(--canvas)] relative overflow-hidden select-none">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-[var(--oak)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-[var(--sage)]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-5 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--oak)] to-[#D07B30] text-white shadow-md hover:scale-105 transition-transform"
          >
            <IconBuildingCommunity size={24} />
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text)]">
            Apartment Survival
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] max-w-xs mx-auto">
            Zero-math expense splitting, real-time pantry tracking & flatmate tabs.
          </p>
        </div>

        {/* Auth Content Card */}
        <div className="card-custom p-6 sm:p-7 shadow-xl border border-[var(--border-strong)] bg-[var(--card)]/95 backdrop-blur-md rounded-3xl">
          <Outlet />
        </div>

        {/* App Footer Info */}
        <div className="text-center text-[11px] text-[var(--muted)]">
          Apartment Survival OS · Designed for shared-living harmony
        </div>
      </div>
    </div>
  );
};
