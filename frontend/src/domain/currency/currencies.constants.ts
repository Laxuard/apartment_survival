import type { CurrencyInfo } from './types';

export const DEFAULT_CURRENCY = 'MAD';

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'MAD', symbol: 'MAD', label: 'Moroccan Dirham', country: 'Morocco', decimals: 2 },
  { code: 'EUR', symbol: '€', label: 'Euro', country: 'European Union', decimals: 2 },
  { code: 'USD', symbol: '$', label: 'US Dollar', country: 'United States', decimals: 2 },
  { code: 'GBP', symbol: '£', label: 'British Pound', country: 'United Kingdom', decimals: 2 },
  { code: 'CAD', symbol: 'CA$', label: 'Canadian Dollar', country: 'Canada', decimals: 2 },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = SUPPORTED_CURRENCIES.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<string, CurrencyInfo>
);

