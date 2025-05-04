
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

/**
 * Format a date to a relative time string (e.g. "2 days ago")
 * @param date - The date to format
 * @returns Formatted relative date string
 */
export const formatDateToRelative = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};
