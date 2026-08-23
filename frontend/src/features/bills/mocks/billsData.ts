import type { Bill } from '../types';

export const MOCK_BILLS: Bill[] = [
  {
    id: 'bill-1',
    title: 'Orange Wi-Fi',
    dueText: 'Due in 3 days · Auto-split on',
    dueDays: 3,
    amount: 250.0,
    currency: 'MAD',
    autoSplit: true,
    iconName: 'wifi',
  },
  {
    id: 'bill-2',
    title: 'Apartment rent',
    dueText: 'Due in 8 days · 1,000 MAD / person',
    dueDays: 8,
    amount: 4000.0,
    currency: 'MAD',
    autoSplit: false,
    perPersonText: '1,000 MAD / person',
    iconName: 'home',
  },
];
