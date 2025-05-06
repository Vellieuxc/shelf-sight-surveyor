
import { AnalysisData } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Transform the analysis result from the Claude analyzer to the format
 * expected by the frontend
 */
export function transformAnalysisResult(response: any): any {
  // Handle empty or invalid responses
  if (!response) {
    console.warn("Empty analysis response received");
    // Return empty structured data instead of null
    return {
      metadata: {
        total_items: 0,
        out_of_stock_positions: 0
      },
      shelves: []
    };
  }
  
  if (!response.data) {
    console.warn("No data property in analysis response", response);
    
    // If there's an error related to OCR service, return empty structured data
    if (response.error && response.error.includes("OCR service")) {
      console.log("OCR service unavailable, returning empty structured data");
      return {
        metadata: {
          total_items: 0,
          out_of_stock_positions: 0
        },
        shelves: []
      };
    }
    
    // For other errors, return empty structured data
    return {
      metadata: {
        total_items: 0,
        out_of_stock_positions: 0
      },
      shelves: []
    };
  }
  
  // Return the complete raw response data structure without transformation
  // to preserve the hierarchical structure from Claude
  console.log("Returning complete analysis data:", response.data);
  return response.data;
}

/**
 * Ensures that analysis data is preserved in its original format
 * for proper display
 */
export function ensureAnalysisDataType(data: Json | null): any {
  if (!data) {
    console.warn("Invalid or empty analysis data format", data);
    // Return minimal valid structured data instead of null
    return {
      metadata: {
        total_items: 0,
        out_of_stock_positions: 0
      },
      shelves: []
    };
  }
  
  // Return the raw data without transformation
  return data;
}

// Keep the utility functions for compatibility with existing code,
// but they will not be used for Claude data transformation
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
