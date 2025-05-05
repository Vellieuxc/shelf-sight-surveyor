
/**
 * Transform the analysis data from Claude into our standard format
 */
export function transformAnalysisData(analysisData: any[]): any[] {
  if (!analysisData || !Array.isArray(analysisData)) {
    console.warn("Invalid analysis data format:", analysisData);
    return [];
  }

  return analysisData.map(item => {
    if (typeof item !== 'object' || item === null) {
      console.warn("Invalid analysis item:", item);
      return createEmptyAnalysisItem();
    }

    // Handle both formats - old direct array format and new SKUs wrapper format
    const dataItem = item;
    
    // Return standardized format with new fields from the enhanced prompt
    return {
      brand: dataItem.SKUBrand || "",
      sku_name: dataItem.SKUFullName || "",
      sku_count: typeof dataItem.NumberFacings === 'number' ? dataItem.NumberFacings : 1,
      sku_price: typeof dataItem.PriceSKU === 'string' ? parseFloatPrice(dataItem.PriceSKU) : 0,
      sku_position: dataItem.ShelfSection || "middle",
      sku_confidence: determineSKUConfidence(dataItem),
      empty_space_estimate: dataItem.empty_space_estimate || 0,
      category1: dataItem.ProductCategory1 || null,
      category2: dataItem.ProductCategory2 || null,
      category3: dataItem.ProductCategory3 || null,
      pack_size: dataItem.PackSize || null,
      flavor: dataItem.Flavor || null,
      out_of_stock: dataItem.OutofStock === true,
      misplaced: dataItem.Misplaced === true,
      bounding_box: dataItem.BoundingBox || null,
      tags: Array.isArray(dataItem.Tags) ? dataItem.Tags : [],
      image_id: dataItem.ImageID || null,
      color: dataItem.color || "",
      package_size: dataItem.package_size || ""
    };
  });
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
    brand: "",
    sku_name: "",
    sku_count: 1,
    sku_price: 0,
    sku_position: "middle",
    sku_confidence: "medium",
    empty_space_estimate: 0,
    category1: null,
    category2: null,
    category3: null,
    pack_size: null,
    flavor: null,
    out_of_stock: false,
    misplaced: false,
    bounding_box: null,
    tags: ["Unrecognized SKU"],
    image_id: null,
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
