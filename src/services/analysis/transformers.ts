import { AnalysisData, AnalysisResult } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Transform the analysis result from the Claude analyzer to the format
 * expected by the frontend
 * Enhanced with better error handling, more robust type checking, and fallback mechanisms
 */
export function transformAnalysisResult(data: any): AnalysisResult | null {
  if (!data || !data.data || !data.data.metadata || !data.data.shelves) {
    return null;
  }

  try {
    return {
      metadata: {
        analysis_status: data.data.metadata.analysis_status || 'empty',
        out_of_stock_positions: data.data.metadata.out_of_stock_positions || 0,
        total_items: data.data.metadata.total_items || 0,
      },
      shelves: data.data.shelves || [],
    };
  } catch (error) {
    console.error('Error transforming analysis result:', error);
    return null;
  }
}

/**
 * Ensures that analysis data is preserved in its original format
 * Enhanced with better error handling and proper TypeScript type checking
 */
export function ensureAnalysisDataType(data: Json | null): any {
  if (!data) {
    console.warn("Invalid or empty analysis data format", data);
    return createEmptyAnalysisStructure();
  }
  
  try {
    // If it's an array format
    if (Array.isArray(data)) {
      return data;
    }
    
    // If data is already in the structured format with metadata and shelves
    // We need to cast to check for properties safely
    if (typeof data === 'object' && !Array.isArray(data)) {
      const objData = data as Record<string, unknown>;
      if ('metadata' in objData || 'shelves' in objData) {
        return data;
      }
    }
    
    // Attempt to parse JSON string if needed
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error("Failed to parse analysis data from string:", parseError);
        return createEmptyAnalysisStructure();
      }
    }
    
    // Return the raw data as fallback
    return data;
  } catch (error) {
    console.error("Error ensuring analysis data type:", error);
    return createEmptyAnalysisStructure();
  }
}

/**
 * Creates an empty but valid analysis structure
 */
function createEmptyAnalysisStructure(): any {
  return {
    metadata: {
      total_items: 0,
      out_of_stock_positions: 0,
      analysis_status: "empty"
    },
    shelves: []
  };
}

// Keep utility functions for compatibility with existing code
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
