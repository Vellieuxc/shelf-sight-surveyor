
import { AnalysisData } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Ensures that analysis data is correctly typed and formatted
 * for frontend display
 */
export function ensureAnalysisDataType(data: Json[] | null): AnalysisData[] {
  if (!data || !Array.isArray(data)) {
    console.warn("Invalid or empty analysis data format", data);
    return [];
  }
  
  return data.map(item => {
    if (typeof item !== 'object' || item === null) {
      console.warn("Invalid analysis item", item);
      return createEmptyAnalysisItem();
    }
    
    const typedItem = item as Record<string, any>;
    
    // Return properly formatted analysis data
    return {
      brand: typedItem.brand || typedItem.SKUBrand || "",
      sku_name: typedItem.sku_name || typedItem.SKUFullName || "",
      sku_count: typeof typedItem.sku_count === 'number' 
        ? typedItem.sku_count 
        : (typeof typedItem.NumberFacings === 'number' ? typedItem.NumberFacings : 1),
      sku_price: typeof typedItem.sku_price === 'number' 
        ? typedItem.sku_price 
        : parseFloatPrice(typedItem.PriceSKU || "0"),
      sku_position: typedItem.sku_position || typedItem.ShelfSection || "middle",
      sku_confidence: typedItem.sku_confidence || determineSKUConfidence(typedItem),
      empty_space_estimate: typedItem.empty_space_estimate || 0,
      color: typedItem.color || "",
      package_size: typedItem.package_size || ""
    };
  });
}

/**
 * Determine SKU confidence based on BoundingBox confidence or other factors
 */
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

/**
 * Creates an empty analysis item with default values
 */
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

/**
 * Parse price from string, handling currency symbols
 */
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

/**
 * Transform the analysis result from the edge function to the format
 * expected by the frontend
 */
export function transformAnalysisResult(response: any): AnalysisData[] {
  // Handle empty, null or invalid responses with a clear error message
  if (!response) {
    console.warn("Empty analysis response received");
    return [];
  }
  
  if (!response.data) {
    console.warn("No data property in analysis response", response);
    return [];
  }
  
  if (!Array.isArray(response.data)) {
    console.warn("Analysis data is not an array", response.data);
    return [];
  }
  
  if (response.data.length === 0) {
    console.warn("Analysis data array is empty", response);
    return [];
  }
  
  return ensureAnalysisDataType(response.data);
}
