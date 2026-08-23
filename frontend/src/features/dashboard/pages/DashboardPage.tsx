import React from 'react';
import { HeroBalance } from '../components/HeroBalance';
import { RecentActivityCard } from '../components/RecentActivityCard';
import { RoommateBalancesCard } from '../components/RoommateBalancesCard';
import { RestockAlertsCard } from '../components/RestockAlertsCard';
import { UpcomingBillsCard } from '../components/UpcomingBillsCard';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <HeroBalance />

      <div className="dash-grid">
        <RecentActivityCard />
        <RoommateBalancesCard />
        <RestockAlertsCard />
        <UpcomingBillsCard />
      </div>
    </div>
  );
};
