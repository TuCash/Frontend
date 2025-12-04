/**
 * Currency utilities for formatting and symbol mapping
 */

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

/**
 * Map of currency codes to their symbols
 */
const CURRENCY_SYMBOLS: Record<string, string> = {
  PEN: 'S/',
  USD: '$',
  EUR: '€',
  GBP: '£',
  BRL: 'R$',
  MXN: '$',
  ARS: '$',
  COP: '$',
  CLP: '$',
  JPY: '¥',
  CNY: '¥',
};

/**
 * Get the currency symbol for a given currency code
 * @param currencyCode - ISO 4217 currency code (e.g., 'USD', 'EUR', 'PEN')
 * @returns The currency symbol (e.g., '$', '€', 'S/')
 */
export function getCurrencySymbol(currencyCode: string | undefined | null): string {
  if (!currencyCode) return 'S/';
  const code = currencyCode.toUpperCase();
  return CURRENCY_SYMBOLS[code] || currencyCode;
}

/**
 * Format an amount with the appropriate currency symbol
 * @param amount - The numeric amount
 * @param currencyCode - ISO 4217 currency code
 * @param showSign - Whether to show + or - sign
 * @returns Formatted string (e.g., '$100.00', '+€50.00')
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'PEN',
  showSign: boolean = false
): string {
  const symbol = getCurrencySymbol(currencyCode);
  const sign = showSign ? (amount >= 0 ? '+' : '-') : '';
  const absAmount = Math.abs(amount);
  return `${sign}${symbol}${absAmount.toFixed(2)}`;
}

/**
 * List of supported currencies with their info
 */
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
];
