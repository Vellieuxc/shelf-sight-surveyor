
import { AnalysisData } from "@/types";
import { AnalysisResponse } from "./types";

/**
 * Transform raw analysis response into application data format
 */
export function transformAnalysisResult(response: AnalysisResponse): AnalysisData[] {
  // Check if the response is valid
  if (!response || !response.data) {
    console.error("Invalid analysis response:", response);
    return [];
  }
  
  console.log(`Transforming analysis result with ${response.data.length} items`);
  
  // Convert to proper AnalysisData format
  return ensureAnalysisDataType(response.data);
}

/**
 * Ensure analysis data is properly typed as AnalysisData[]
 */
export function ensureAnalysisDataType(data: any[]): AnalysisData[] {
  if (!Array.isArray(data)) {
    console.error("Analysis data is not an array");
    return [];
  }
  
  return data.map(item => ({
    brand: item.brand || "",
    sku_name: item.sku_name || item.product || "",
    sku_count: parseInt(String(item.sku_count)) || parseInt(String(item.visibility)) || 1,
    sku_price: parseFloat(String(item.sku_price)) || 0,
    sku_position: item.sku_position || item.position || "",
    sku_confidence: item.sku_confidence || "high",
    color: item.color || "",
    package_size: item.package_size || ""
  }));
}
