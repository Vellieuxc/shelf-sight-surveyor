
export const useFormatPrice = () => {
  // Helper function to safely format price values
  const formatPrice = (price: any): string => {
    // Check if price is a valid number
    if (typeof price === 'number' && !isNaN(price)) {
      return `$${price.toFixed(2)}`;
    }
    return "-";
  };

  return { formatPrice };
};
