export type CurrencyCode = 'MAD' | 'USD' | 'EUR' | 'GBP' | 'CAD' | string;

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  label: string;
  country: string;
  decimals: number;
}

export interface CurrencyFormatOptions {
  showSymbol?: boolean;
  showCode?: boolean;
  decimals?: number;
  signed?: boolean;
  useGrouping?: boolean;
}

