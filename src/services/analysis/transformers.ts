
import { AnalysisData } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Transform the analysis result from the edge function to the format
 * expected by the frontend, preserving the raw structure from Claude
 */
export function transformAnalysisResult(response: any): any {
  // Handle empty or invalid responses
  if (!response) {
    console.warn("Empty analysis response received");
    return null;
  }
  
  if (!response.data) {
    console.warn("No data property in analysis response", response);
    return null;
  }
  
  // Return the raw data without any transformation
  return response.data;
}

/**
 * Ensures that analysis data is preserved in its original format
 * without any transformation
 */
export function ensureAnalysisDataType(data: Json | null): any {
  if (!data) {
    console.warn("Invalid or empty analysis data format", data);
    return null;
  }
  
  // Return the raw data as is, without any transformation
  return data;
}

// Keep the utility functions for compatibility with existing code,
// but they will not be used for transformation
function determineSKUConfidence(item: Record<string, any>): string {
  if (item.sku_confidence) {
    return item.sku_confidence;
  }
  
  if (item.BoundingBox && typeof item.BoundingBox.confidence === 'number') {
    const confidence = item.BoundingBox.confidence;
    if (confidence > 0.9) return "high";
    if (confidence > 0.7) return "medium";
    return "low";
  }
  
  return "medium"; // Default
}

function createEmptyAnalysisItem(): AnalysisData {
  return {
    brand: "",
    sku_name: "",
    sku_count: 1,
    sku_price: 0,
    sku_position: "middle",
    sku_confidence: "medium",
    empty_space_estimate: 0,
    color: "",
    package_size: ""
  };
}

function parseFloatPrice(priceStr: string): number {
  if (typeof priceStr !== 'string') return 0;
  
  const normalized = priceStr
    .replace(/[$€£¥]/g, '')
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '')
    .trim();
    
  const price = parseFloat(normalized);
  return isNaN(price) ? 0 : price;
}
