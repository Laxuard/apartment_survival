export type StockStatus = 'in_stock' | 'low' | 'out';

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  status: StockStatus;
  badgeLabel: string;
  quantity?: number;
  unit?: string;
  iconName: 'coffee' | 'egg' | 'droplet' | 'bread' | 'milk';
  onGroceryList?: boolean;
}

export interface CreatePantryItemDto {
  name: string;
  category: string;
  quantity: number;
  unit?: string;
  iconName?: 'coffee' | 'egg' | 'droplet' | 'bread' | 'milk';
}

export interface UpdateStockDto {
  quantity: number;
  status: StockStatus;
  badgeLabel: string;
}
