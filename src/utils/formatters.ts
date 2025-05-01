
/**
 * Utility functions for formatting data throughout the application
 */

/**
 * Formats a price value to currency display format
 * @param price - The price value to format
 * @returns Formatted price string with currency symbol
 */
export const formatPrice = (price: any): string => {
  // Check if price is a valid number
  if (typeof price === 'number' && !isNaN(price)) {
    return `$${price.toFixed(2)}`;
  }
  return "-";
};
