/**
 * Formats a number as currency.
 * @param amount - The amount of money to format.
 * @param locale - The locale to use for formatting (e.g., 'en-US', 'de-DE').
 * @param currency - The currency code to use (e.g., 'USD', 'EUR').
 * @returns The formatted currency string.
 */
export function formatCurrency(amount: number, currency = 'ETB', locale = 'en'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}
