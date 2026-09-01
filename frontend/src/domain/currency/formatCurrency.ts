import { CURRENCY_MAP, DEFAULT_CURRENCY } from './currencies.constants';
import type { CurrencyFormatOptions, CurrencyInfo } from './types';

/**
 * Retrieves metadata for a given currency code. Falls back to a generic CurrencyInfo object if unknown.
 */
export const getCurrencyInfo = (code?: string): CurrencyInfo => {
  const normalized = (code || DEFAULT_CURRENCY).toUpperCase();
  return (
    CURRENCY_MAP[normalized] || {
      code: normalized,
      symbol: normalized,
      label: normalized,
      country: 'International',
      decimals: 2,
    }
  );
};

/**
 * Returns the short display symbol or code for the currency.
 */
export const getCurrencySymbol = (code?: string): string => {
  return getCurrencyInfo(code).symbol;
};

/**
 * Universal money formatter for financial figures across the application.
 *
 * Example output:
 * formatMoney(1250) -> "1,250.00 MAD"
 * formatMoney(1250, 'EUR') -> "1,250.00 €"
 * formatMoney(1250, 'USD', { showCode: true }) -> "1,250.00 USD"
 */
export const formatMoney = (
  amount: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  options: CurrencyFormatOptions = {}
): string => {
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  const safeNum = Number.isFinite(num) ? num : 0;
  const decimals = options.decimals ?? 2;
  const curr = getCurrencyInfo(currency);

  const formattedNumber = safeNum.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: options.useGrouping ?? true,
  });

  const sign = options.signed && safeNum > 0 ? '+' : '';

  if (options.showCode) {
    return `${sign}${formattedNumber} ${curr.code}`;
  }

  // If the symbol is alphabetical code (e.g. 'MAD'), place it as a trailing suffix: "1,250.00 MAD"
  // If it's a standard symbol (e.g. '€', '$', '£'), we can still keep consistency or standard placement
  return `${sign}${formattedNumber} ${curr.code}`;
};

/**
 * Format money with explicit +/- signs for ledger balances, debts, and credits.
 *
 * Example output:
 * formatSignedMoney(120, 'MAD') -> "+120.00 MAD"
 * formatSignedMoney(-45, 'MAD') -> "-45.00 MAD"
 * formatSignedMoney(0, 'MAD')   -> "0.00 MAD"
 */
export const formatSignedMoney = (
  amount: number | string | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  options: CurrencyFormatOptions = {}
): string => {
  return formatMoney(amount, currency, { ...options, signed: true });
};

