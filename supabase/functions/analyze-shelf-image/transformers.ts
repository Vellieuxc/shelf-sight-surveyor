
/**
 * Transform the analysis data from Claude into our standard format
 */
export function transformAnalysisData(analysisData: any[]): any[] {
  if (!analysisData || !Array.isArray(analysisData)) {
    console.warn("Invalid analysis data format:", analysisData);
    return [];
  }

  // Handle the case where we might receive the SKUs wrapper object format
  if (!Array.isArray(analysisData) && analysisData.SKUs && Array.isArray(analysisData.SKUs)) {
    return analysisData.SKUs;
  }

  // If it's already an array, just return it as is (preserving the raw structure)
  return analysisData;
}

/**
 * Determine SKU confidence level based on BoundingBox confidence or available data
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
  
  return "medium"; // Default confidence
}

/**
 * Creates an empty analysis item with default values
 */
function createEmptyAnalysisItem(): any {
  return {
    SKUFullName: "",
    SKUBrand: "",
    NumberFacings: 1,
    PriceSKU: "0",
    ShelfSection: "middle",
    OutofStock: false,
    Misplaced: false,
    BoundingBox: null,
    Tags: ["Unrecognized SKU"],
    ProductCategory1: null,
    ProductCategory2: null,
    ProductCategory3: null,
    PackSize: null,
    Flavor: null,
    ImageID: null
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
