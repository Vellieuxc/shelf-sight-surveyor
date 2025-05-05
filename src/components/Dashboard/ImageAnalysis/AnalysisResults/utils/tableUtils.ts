
import { AnalysisData } from "@/types";

/**
 * Sort data to put empty spaces at the end and extract summary items
 * @param data The analysis data array
 * @returns Object containing sorted data and optional summary item
 */
export const prepareTableData = (data: AnalysisData[]) => {
  // Sort data to put empty spaces at the end
  const sortedData = [...data].sort((a, b) => {
    // Move summary items (not products) to the end
    if (a.total_sku_facings || a.quality_picture) return 1;
    if (b.total_sku_facings || b.quality_picture) return -1;

    // Move empty spaces to the end, but before summary items
    if (a.empty_space_estimate && !b.empty_space_estimate) return 1;
    if (!a.empty_space_estimate && b.empty_space_estimate) return -1;
    
    return 0;
  });

  // Extract summary fields if they exist
  const summaryItem = sortedData.find(item => item.total_sku_facings || item.quality_picture);
  
  // Remove summary item from display data if it exists
  const displayData = summaryItem ? sortedData.filter(item => item !== summaryItem) : sortedData;
  
  return {
    displayData,
    summaryItem
  };
};

/**
 * Determine if pre-promotion prices should be displayed
 * @param data The analysis data array
 * @returns Boolean indicating if any items have pre-promotion prices
 */
export const shouldShowPrePromo = (data: AnalysisData[]): boolean => {
  return data.some(item => item.sku_price_pre_promotion);
};
