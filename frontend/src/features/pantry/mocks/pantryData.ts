import type { PantryItem } from '../types';

export const MOCK_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'coffee',
    name: 'Coffee beans',
    category: 'Beverages',
    status: 'out',
    badgeLabel: 'Out',
    iconName: 'coffee',
  },
  {
    id: 'eggs',
    name: 'Eggs',
    category: 'Dairy & Eggs',
    status: 'low',
    badgeLabel: '2 left',
    quantity: 2,
    unit: 'pcs',
    iconName: 'egg',
  },
  {
    id: 'oil',
    name: 'Olive oil',
    category: 'Cooking',
    status: 'low',
    badgeLabel: 'Low',
    iconName: 'droplet',
  },
];
