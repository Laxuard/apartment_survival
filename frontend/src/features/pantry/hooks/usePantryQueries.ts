import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { pantryApi } from '../api/pantryApi';
import { queryKeys } from '@/lib/queryKeys';
import type { PantryItem, CreatePantryItemDto, UpdateStockDto } from '../types';

export const PANTRY_QUERY_KEY = (householdId: string | null) =>
  householdId ? queryKeys.pantry.all(householdId) : (['pantry', null] as const);

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

export interface AdjustStockVariables {
  itemId: string;
  targetQty: number;
}

export interface AdjustStockContext {
  previousItems?: PantryItem[];
}

export const useAdjustStockMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<PantryItem, Error, AdjustStockVariables, AdjustStockContext>({
    mutationFn: async ({ itemId, targetQty }: AdjustStockVariables) => {
      if (!householdId) throw new Error('No active household selected');

      const newStatus = targetQty === 0 ? 'out' : targetQty <= 2 ? 'low' : 'in_stock';
      const newBadge = targetQty === 0 ? 'Out' : targetQty <= 2 ? `${targetQty} left` : 'In Stock';

      const updateDto: UpdateStockDto = {
        quantity: targetQty,
        status: newStatus,
        badgeLabel: newBadge,
      };

      return await pantryApi.updateStock(householdId, itemId, updateDto);
    },
    onMutate: async ({ itemId, targetQty }) => {
      if (!householdId) return { previousItems: undefined };

      await queryClient.cancelQueries({ queryKey: queryKeys.pantry.all(householdId) });
      const previousItems = queryClient.getQueryData<PantryItem[]>(queryKeys.pantry.all(householdId));

      queryClient.setQueryData<PantryItem[]>(queryKeys.pantry.all(householdId), (old = []) => {
        return old.map((item) => {
          if (item.id !== itemId) return item;
          const newStatus = targetQty === 0 ? 'out' : targetQty <= 2 ? 'low' : 'in_stock';
          const newBadge = targetQty === 0 ? 'Out' : targetQty <= 2 ? `${targetQty} left` : 'In Stock';
          return {
            ...item,
            quantity: targetQty,
            status: newStatus,
            badgeLabel: newBadge,
          };
        });
      });

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (householdId && context?.previousItems) {
        queryClient.setQueryData(queryKeys.pantry.all(householdId), context.previousItems);
      }
      toast.error('Update failed. Reverted to previous state.');
    },
    onSettled: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.pantry.all(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(householdId) });
      }
    },
  });
};

export interface ToggleGroceryVariables {
  itemId: string;
  onList: boolean;
}

export interface ToggleGroceryContext {
  previousItems?: PantryItem[];
}

export const useToggleGroceryMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; onGroceryList: boolean },
    Error,
    ToggleGroceryVariables,
    ToggleGroceryContext
  >({
    mutationFn: async ({ itemId, onList }: ToggleGroceryVariables) => {
      if (!householdId) throw new Error('No active household selected');
      return await pantryApi.toggleGroceryList(householdId, itemId, onList);
    },
    onMutate: async ({ itemId, onList }) => {
      if (!householdId) return { previousItems: undefined };

      await queryClient.cancelQueries({ queryKey: queryKeys.pantry.all(householdId) });
      const previousItems = queryClient.getQueryData<PantryItem[]>(queryKeys.pantry.all(householdId));

      queryClient.setQueryData<PantryItem[]>(queryKeys.pantry.all(householdId), (old = []) => {
        return old.map((item) =>
          item.id === itemId ? { ...item, onGroceryList: onList } : item
        );
      });

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (householdId && context?.previousItems) {
        queryClient.setQueryData(queryKeys.pantry.all(householdId), context.previousItems);
      }
      toast.error('Update failed. Reverted to previous state.');
    },
    onSettled: () => {
      if (householdId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.pantry.all(householdId) });
      }
    },
  });
};

export const useAddPantryItemMutation = (householdId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation<PantryItem, Error, CreatePantryItemDto>({
    mutationFn: async (dto: CreatePantryItemDto) => {
      if (!householdId) throw new Error('No active household selected');
      return await pantryApi.createItem(householdId, dto);
    },
    onSuccess: (newItem) => {
      if (householdId) {
        queryClient.setQueryData<PantryItem[]>(queryKeys.pantry.all(householdId), (old = []) => [
          ...old,
          newItem,
        ]);
        queryClient.invalidateQueries({ queryKey: queryKeys.pantry.all(householdId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(householdId) });
      }
    },
  });
};
