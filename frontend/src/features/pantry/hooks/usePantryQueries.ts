import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pantryApi } from '../api/pantryApi';
import type { PantryItem, CreatePantryItemDto, UpdateStockDto } from '../types';

export const PANTRY_QUERY_KEY = (householdId: string | null) => [
  'households',
  householdId,
  'pantry',
];

export const usePantryItemsQuery = (householdId: string | null) => {
  return useQuery<PantryItem[]>({
    queryKey: PANTRY_QUERY_KEY(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      return await pantryApi.getItems(householdId);
    },
    enabled: !!householdId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useAdjustStockMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, delta }: { itemId: string; delta: number }) => {
      if (!householdId) throw new Error('No active household selected');
      const items = queryClient.getQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId)) || [];
      const target = items.find((i) => i.id === itemId);
      const currentQty = target?.quantity ?? (target?.status === 'out' ? 0 : 2);
      const newQty = Math.max(0, currentQty + delta);
      const newStatus = newQty === 0 ? 'out' : newQty <= 2 ? 'low' : 'in_stock';
      const newBadge = newQty === 0 ? 'Out' : newQty <= 2 ? `${newQty} left` : 'In Stock';

      const updateDto: UpdateStockDto = {
        quantity: newQty,
        status: newStatus,
        badgeLabel: newBadge,
      };

      return await pantryApi.updateStock(householdId, itemId, updateDto);
    },
    onMutate: async ({ itemId, delta }) => {
      await queryClient.cancelQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
      const previousItems = queryClient.getQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId));

      queryClient.setQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId), (old = []) => {
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
      if (!householdId) throw new Error('No active household selected');
      return await pantryApi.toggleGroceryList(householdId, itemId, onList);
    },
    onMutate: async ({ itemId, onList }) => {
      await queryClient.cancelQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
      const previousItems = queryClient.getQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId));

      queryClient.setQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId), (old = []) => {
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
      if (!householdId) throw new Error('No active household selected');
      return await pantryApi.createItem(householdId, dto);
    },
    onSuccess: (newItem) => {
      queryClient.setQueryData<PantryItem[]>(PANTRY_QUERY_KEY(householdId), (old = []) => [
        ...old,
        newItem,
      ]);
      queryClient.invalidateQueries({ queryKey: PANTRY_QUERY_KEY(householdId) });
    },
  });
};
