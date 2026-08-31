import React from 'react';
import { HeroBalance } from '../components/HeroBalance';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { RestockAlertsCard } from '../components/RestockAlertsCard';
import { RoommateBalancesCard } from '../components/RoommateBalancesCard';
import { UpcomingBillsCard } from '../components/UpcomingBillsCard';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-5 animate-fade-in select-none">
      {/* 1. Generous Hero Financial Anchor */}
      <HeroBalance />

      {/* 2. Asymmetric 7 / 5 (60/40) Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (Primary Feed, 7 Cols = 58%): Deep Vertical Ledger */}
        <div className="lg:col-span-7 flex flex-col h-full">
          <RecentActivityCard />
        </div>

        {/* Right Column (Widgets, 5 Cols = 42%): Dense Summaries & Wrapping Chips */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <RoommateBalancesCard />
          <UpcomingBillsCard />
          <RestockAlertsCard />
        </div>
      </div>
    </div>
  );
};
