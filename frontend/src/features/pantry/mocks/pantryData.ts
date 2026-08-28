import type { PantryItem } from '../types';

export const MOCK_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'coffee',
    name: 'Coffee beans',
    category: 'Beverages',
    status: 'out',
    badgeLabel: 'Out',
    quantity: 0,
    unit: 'bags',
    iconName: 'coffee',
    onGroceryList: true,
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
    onGroceryList: true,
  },
  {
    id: 'oil',
    name: 'Olive oil',
    category: 'Cooking',
    status: 'low',
    badgeLabel: 'Low',
    quantity: 1,
    unit: 'bottle',
    iconName: 'droplet',
    onGroceryList: false,
  },
];
