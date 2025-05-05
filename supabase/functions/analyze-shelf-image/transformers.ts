/**
 * Transform raw analysis data into standardized format
 */
export function transformAnalysisData(analysisData: any[]): any[] {
  if (!Array.isArray(analysisData)) {
    console.error("Invalid analysis data format:", analysisData);
    return [];
  }
  
  return analysisData
    .filter(item => item && typeof item === 'object')
    .map(item => {
      // Normalize field names from Claude's output
      return {
        // Product identification - standardize the field names
        brand: item.SKUBrand || item.brand || item.Brand || "",
        sku_name: item.SKUFullName || item.product || item.Product || item.ProductName || "",
        sku_count: parseNumberFacing(item),
        sku_price: extractPrice(item),
        
        // Position and visibility
        sku_position: item.ShelfSection || item.position || item.Position || "middle",
        sku_confidence: calculateConfidence(item),
        
        // Additional data if available
        empty_space_estimate: item.OutofStock ? 100 : 0,
        color: item.color || item.packagingColor || "",
        package_size: item.package_size || item.PackageSize || ""
      };
    });
}

// Helper to parse number of facings
function parseNumberFacing(item: any): number {
  // Try different possible field names
  const count = item.NumberFacings || item.facings || item.visibility || item.Visibility;
  
  // If the value is a string, try to parse it as a number
  if (typeof count === 'string') {
    const parsed = parseInt(count.replace(/\D/g, ''), 10);
    return isNaN(parsed) ? 1 : parsed;
  }
  
  return typeof count === 'number' ? count : 1;
}

// Helper to extract price
function extractPrice(item: any): number {
  // Try different possible field names
  const price = item.PriceSKU || item.price || item.Price;
  
  if (!price) return 0;
  
  // If the price is already a number, return it
  if (typeof price === 'number') return price;
  
  // Otherwise, try to parse from string
  if (typeof price === 'string') {
    // Remove currency symbols and normalize format
    const normalized = price
      .replace(/[$€£¥]/g, '')  // Remove currency symbols
      .replace(/,/g, '.')      // Replace comma with dot for decimal
      .replace(/[^0-9.]/g, '') // Keep only numbers and decimal points
      .trim();
    
    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  return 0;
}

// Helper to calculate confidence level
function calculateConfidence(item: any): string {
  // Get confidence value if available
  let confidence: number | undefined;
  
  if (item.BoundingBox && typeof item.BoundingBox.confidence === 'number') {
    confidence = item.BoundingBox.confidence;
  } else if (typeof item.confidence === 'number') {
    confidence = item.confidence;
  } else if (typeof item.Confidence === 'number') {
    confidence = item.Confidence;
  }
  
  // Return confidence level based on value
  if (confidence === undefined) return "medium";
  
  if (confidence >= 0.9) return "high";
  if (confidence >= 0.7) return "medium";
  return "low";
}
