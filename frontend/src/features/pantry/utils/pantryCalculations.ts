import type { PantryItem, StockStatus } from '../types';

export interface PantryMetrics {
  totalCount: number;
  criticalCount: number;
  stockedCount: number;
  groceryCount: number;
  criticalItems: PantryItem[];
  stockedItems: PantryItem[];
  groceryListItems: PantryItem[];
}

export interface StockProgressInfo {
  percentage: number;
  fillClass: 'low' | 'half' | 'full';
}

export interface StockBadgeInfo {
  label: string;
  badgeClass: string;
}

/**
 * Universal Stock Progress Calculation
 * Normalizes visual stock meters across Dashboard and Pantry page.
 */
export const getStockProgress = (status: StockStatus): StockProgressInfo => {
  switch (status) {
    case 'out':
      return { percentage: 5, fillClass: 'low' };
    case 'low':
      return { percentage: 35, fillClass: 'half' };
    case 'in_stock':
    default:
      return { percentage: 85, fillClass: 'full' };
  }
};

/**
 * Universal Stock Badge Formatting
 */
export const getStockBadge = (item: PantryItem): StockBadgeInfo => {
  if (item.status === 'out') {
    return {
      label: item.badgeLabel || 'Out',
      badgeClass: 'bg-[var(--negative-bg)] text-[var(--negative-text)] pulse-subtle',
    };
  }
  if (item.status === 'low') {
    return {
      label: item.badgeLabel || 'Low',
      badgeClass: 'bg-[var(--warn-bg)] text-[var(--warn-text)]',
    };
  }
  return {
    label: item.badgeLabel || 'Stocked',
    badgeClass: 'bg-[var(--positive-bg)] text-[var(--positive-text)]',
  };
};

/**
 * Pure function to calculate all pantry metrics from an item list.
 */
export const calculatePantryMetrics = (items: PantryItem[]): PantryMetrics => {
  const criticalItems = items.filter((i) => i.status === 'out' || i.status === 'low');
  const stockedItems = items.filter((i) => i.status === 'in_stock');
  const groceryListItems = items.filter((i) => i.onGroceryList);

  return {
    totalCount: items.length,
    criticalCount: criticalItems.length,
    stockedCount: stockedItems.length,
    groceryCount: groceryListItems.length,
    criticalItems,
    stockedItems,
    groceryListItems,
  };
};
