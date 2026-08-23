export interface DashboardMetrics {
  netBalance: number;
  currency: string;
  isOwed: boolean;
  nudgeText: string;
}

export interface ActivityDemoState {
  state: 'live' | 'skeleton' | 'empty';
}
