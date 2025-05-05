
import { AnalysisData } from "@/types";
import { AnalysisResponse } from "./types";

/**
 * Transforms the raw analysis response into structured analysis data
 * 
 * @param response The raw analysis response from the service
 * @returns Transformed analysis data array
 */
export function transformAnalysisResult(response: AnalysisResponse): AnalysisData[] {
  if (!response.success || !response.data || !Array.isArray(response.data)) {
    throw new Error("Invalid analysis response format");
  }

  // Calculate total facings if not already present
  const hasTotalFacings = response.data.some(item => item.total_sku_facings !== undefined);
  const result = [...response.data] as AnalysisData[];
  
  // Add a summary item if not already present
  if (!hasTotalFacings && result.length > 0) {
    const totalFacings = result.reduce((sum, item) => {
      // Only count items that are not empty spaces
      return sum + (item.empty_space_estimate === undefined ? (item.sku_count || 0) : 0);
    }, 0);
    
    result.push({
      sku_name: "Summary",
      brand: "",
      sku_count: 0,
      sku_price: 0,
      total_sku_facings: totalFacings,
      quality_picture: "Good"
    });
  }
  
  return result;
}

/**
 * Safely transform raw JSON data to properly typed AnalysisData array
 * 
 * @param data Raw data that may come from database or API
 * @returns Properly typed AnalysisData array
 */
export function ensureAnalysisDataType(data: any[]): AnalysisData[] {
  if (!Array.isArray(data)) {
    console.error("Invalid analysis data format, expected array");
    return [];
  }
  
  return data.map(item => ({
    sku_name: item.sku_name || "",
    brand: item.brand || "",
    sku_count: typeof item.sku_count === 'number' ? item.sku_count : 0,
    sku_price: typeof item.sku_price === 'number' ? item.sku_price : 0,
    sku_position: item.sku_position || "",
    sku_price_pre_promotion: item.sku_price_pre_promotion,
    sku_confidence: item.sku_confidence || "unknown",
    empty_space_estimate: item.empty_space_estimate,
    total_sku_facings: item.total_sku_facings,
    quality_picture: item.quality_picture
  }));
}
