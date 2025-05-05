
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
  
  // Direct return if data is already in the expected format
  return response.data;
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
    sku_count: parseInt(item.sku_count) || parseInt(item.visibility) || 1,
    sku_price: parseFloat(item.sku_price) || 0,
    sku_position: item.sku_position || item.position || "",
    sku_confidence: item.sku_confidence || "high",
    color: item.color || "",
    package_size: item.package_size || ""
  }));
}
