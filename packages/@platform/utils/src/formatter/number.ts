/**
 * Formats a number as a percentage.
 * @param value - The percentage value to format.
 * @param isDecimal - Whether the value is a decimal fraction (e.g., 0.25) or a percentage (e.g., 25).
 * @param locale - The locale to use for formatting (e.g., 'en-US', 'de-DE').
 * @param minimumFractionDigits - The minimum number of fraction digits to display.
 * @param maximumFractionDigits - The maximum number of fraction digits to display.
 * @returns The formatted percentage string.
 */
export function formatPercent(
  value: number,
  isDecimal = false,
  locale = 'en',
  minimumFractionDigits = 0,
  maximumFractionDigits = 2
): string {
  // If value is a decimal fraction, divide by 100 to convert to percentage
  const percentageValue = isDecimal ? value : value / 100;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: minimumFractionDigits,
    maximumFractionDigits: maximumFractionDigits
  }).format(percentageValue);
}
