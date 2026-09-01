import { useMemo } from 'react';
import { useHouseholdStore } from '@/stores/useHouseholdStore';
import {
  usePantryItemsQuery,
  useAdjustStockMutation,
  useToggleGroceryMutation,
  useAddPantryItemMutation,
} from './usePantryQueries';
import {
  calculatePantryMetrics,
  getStockProgress,
  getStockBadge,
  type PantryMetrics,
} from '../utils/pantryCalculations';
import type { PantryItem } from '../types';

export interface PantryStockState extends PantryMetrics {
  items: PantryItem[];
  isLoading: boolean;
  adjustQuantity: (id: string, delta: number) => void;
  toggleGrocery: (id: string, currentStatus?: boolean) => void;
  addItem: (item: { name: string; category: string; quantity: number; unit?: string }) => Promise<void>;
  isAddingItem: boolean;
  getStockProgress: typeof getStockProgress;
  getStockBadge: typeof getStockBadge;
}

/**
 * Universal Single Source of Truth Hook for Pantry, Supplies, and Grocery List
 */
export const usePantryStock = (): PantryStockState => {
  const activeHouseholdId = useHouseholdStore((s) => s.activeHouseholdId);
  const { data: items = [], isLoading } = usePantryItemsQuery(activeHouseholdId);

  const adjustStockMutation = useAdjustStockMutation(activeHouseholdId);
  const toggleGroceryMutation = useToggleGroceryMutation(activeHouseholdId);
  const addPantryItemMutation = useAddPantryItemMutation(activeHouseholdId);

  const metrics = useMemo(() => calculatePantryMetrics(items), [items]);

  const adjustQuantity = (id: string, delta: number) => {
    const item = items.find((i) => i.id === id);
    const currentQty = item?.quantity ?? (item?.status === 'out' ? 0 : 2);
    const targetQty = Math.max(0, currentQty + delta);
    adjustStockMutation.mutate({ itemId: id, targetQty });
  };

  const toggleGrocery = (id: string, currentStatus?: boolean) => {
    toggleGroceryMutation.mutate({ itemId: id, onList: !currentStatus });
  };

  const addItem = async (item: {
    name: string;
    category: string;
    quantity: number;
    unit?: string;
  }) => {
    await addPantryItemMutation.mutateAsync({
      name: item.name.trim(),
      category: item.category,
      quantity: item.quantity,
      unit: item.unit || 'units',
      iconName: 'coffee',
    });
  };

  return {
    items,
    isLoading,
    ...metrics,
    adjustQuantity,
    toggleGrocery,
    addItem,
    isAddingItem: addPantryItemMutation.isPending,
    getStockProgress,
    getStockBadge,
  };
};
