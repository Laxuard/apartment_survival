import React from 'react';
import { HeroBalance } from '../components/HeroBalance';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { RoommateBalancesCard } from '../components/RoommateBalancesCard';
import { RestockAlertsCard } from '../components/RestockAlertsCard';
import { UpcomingBillsCard } from '../components/UpcomingBillsCard';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-4 animate-fade-in select-none">
      {/* 1. Generous Hero Financial Anchor */}
      <HeroBalance />

      {/* 2. Balanced 2-Column Dashboard Grid (Richer content scaling, natural fill) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Recent Activity (Top) + Restock Alerts (Bottom) */}
        <div className="space-y-4">
          <RecentActivityCard />
          <RestockAlertsCard />
        </div>

        {/* Right Column: Roommate Balances (Top) + Upcoming Bills (Bottom) */}
        <div className="space-y-4">
          <RoommateBalancesCard />
          <UpcomingBillsCard />
        </div>
      </div>
    </div>
  );
};
