import { apiClient } from '@/lib/api-client';
import type { PantryItem, CreatePantryItemDto, UpdateStockDto } from '../types';

export const pantryApi = {
  getItems: async (householdId: string): Promise<PantryItem[]> => {
    const { data } = await apiClient.get<PantryItem[]>(`/households/${householdId}/pantry`);
    return data;
  },

  createItem: async (householdId: string, dto: CreatePantryItemDto): Promise<PantryItem> => {
    const { data } = await apiClient.post<PantryItem>(`/households/${householdId}/pantry`, dto);
    return data;
  },

  updateStock: async (
    householdId: string,
    itemId: string,
    dto: UpdateStockDto
  ): Promise<PantryItem> => {
    const { data } = await apiClient.put<PantryItem>(
      `/households/${householdId}/pantry/${itemId}/stock`,
      dto
    );
    return data;
  },

  toggleGroceryList: async (
    householdId: string,
    itemId: string,
    onList: boolean
  ): Promise<{ id: string; onGroceryList: boolean }> => {
    const { data } = await apiClient.post<{ id: string; onGroceryList: boolean }>(
      `/households/${householdId}/pantry/${itemId}/grocery`,
      { onGroceryList: onList }
    );
    return data;
  },
};
