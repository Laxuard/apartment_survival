import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pantryApi } from '../api/pantryApi';
import { MOCK_PANTRY_ITEMS } from '../mocks/pantryData';
import type { PantryItem, CreatePantryItemDto, UpdateStockDto } from '../types';

export const PANTRY_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'pantry',
];

// In-memory offline/demo fallback store that persists across queries and mutations
let inMemoryPantryStore: PantryItem[] = [...MOCK_PANTRY_ITEMS];

export const usePantryItemsQuery = (householdId: string | null) => {
  return useQuery<PantryItem[]>({
    queryKey: PANTRY_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return inMemoryPantryStore;
      try {
        const data = await pantryApi.getItems(householdId);
        inMemoryPantryStore = data;
        return data;
      } catch {
        // Return latest in-memory store so mutations are not wiped out
        return [...inMemoryPantryStore];
      }
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdjustStockMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, delta }: { itemId: string; delta: number }) => {
      const target = inMemoryPantryStore.find((i) => i.id === itemId);
      if (!target) throw new Error('Item not found');

      const currentQty = target.quantity ?? (target.status === 'out' ? 0 : 2);
      const newQty = Math.max(0, currentQty + delta);
      const newStatus = newQty === 0 ? 'out' : newQty <= 2 ? 'low' : 'in_stock';
      const newBadge = newQty === 0 ? 'Out' : newQty <= 2 ? `${newQty} left` : 'In Stock';

      const updateDto: UpdateStockDto = {
        quantity: newQty,
        status: newStatus,
        badgeLabel: newBadge,
      };

      // Update in-memory store first
      inMemoryPantryStore = inMemoryPantryStore.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQty,
              status: newStatus,
              badgeLabel: newBadge,
            }
          : item
      );

      if (!householdId) return { ...target, ...updateDto };

      try {
        return await pantryApi.updateStock(householdId, itemId, updateDto);
      } catch {
        return { ...target, ...updateDto };
      }
    },
    onMutate: async ({ itemId, delta }) => {
      await queryClient.cancelQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
      const previousItems = queryClient.getQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId));

      queryClient.setQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId), (old = inMemoryPantryStore) => {
        return old.map((item) => {
          if (item.id !== itemId) return item;
          const currentQty = item.quantity ?? (item.status === 'out' ? 0 : 2);
          const newQty = Math.max(0, currentQty + delta);
          const newStatus = newQty === 0 ? 'out' : newQty <= 2 ? 'low' : 'in_stock';
          const newBadge = newQty === 0 ? 'Out' : newQty <= 2 ? `${newQty} left` : 'In Stock';
          return {
            ...item,
            quantity: newQty,
            status: newStatus,
            badgeLabel: newBadge,
          };
        });
      });

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(PANTRY_QUERY_KEY(householdId), context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
    },
  });
};

export const useToggleGroceryMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, onList }: { itemId: string; onList: boolean }) => {
      // Update in-memory store
      inMemoryPantryStore = inMemoryPantryStore.map((item) =>
        item.id === itemId ? { ...item, onGroceryList: onList } : item
      );

      if (!householdId) return { id: itemId, onGroceryList: onList };
      try {
        return await pantryApi.toggleGroceryList(householdId, itemId, onList);
      } catch {
        return { id: itemId, onGroceryList: onList };
      }
    },
    onMutate: async ({ itemId, onList }) => {
      await queryClient.cancelQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
      const previousItems = queryClient.getQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId));

      queryClient.setQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId), (old = inMemoryPantryStore) => {
        return old.map((item) =>
          item.id === itemId ? { ...item, onGroceryList: onList } : item
        );
      });

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(PANTRY_QUERY_KEY(householdId), context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
    },
  });
};

export const useAddPantryItemMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreatePantryItemDto) => {
      const newItem: PantryItem = {
        id: `pantry-${Date.now()}`,
        name: dto.name,
        category: dto.category,
        quantity: dto.quantity,
        unit: dto.unit || 'units',
        status: dto.quantity === 0 ? 'out' : dto.quantity <= 2 ? 'low' : 'in_stock',
        badgeLabel: dto.quantity === 0 ? 'Out' : dto.quantity <= 2 ? `${dto.quantity} left` : 'In Stock',
        iconName: dto.iconName || 'coffee',
        onGroceryList: false,
      };

      inMemoryPantryStore = [newItem, ...inMemoryPantryStore];

      if (!householdId) return newItem;
      try {
        return await pantryApi.createItem(householdId, dto);
      } catch {
        return newItem;
      }
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId), (old = inMemoryPantryStore) => [
        ...old,
        newItem,
      ]);
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
    },
  });
};
