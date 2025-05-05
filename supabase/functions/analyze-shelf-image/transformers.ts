
// Transform the analysis data to our application format with enhanced security
export function transformAnalysisData(analysisData: any[]): any[] {
  // Validate input is an array
  if (!Array.isArray(analysisData)) {
    console.error("Invalid analysis data format: not an array");
    return [];
  }
  
  return analysisData.map(item => {
    // Skip invalid items
    if (!item || typeof item !== 'object') {
      console.warn("Skipping invalid analysis item:", item);
      return null;
    }
    
    // Safely extract values with type checking and sanitization
    const skuName = typeof item.SKUFullName === 'string' ? item.SKUFullName.substring(0, 255) : '';
    const brand = typeof item.SKUBrand === 'string' ? item.SKUBrand.substring(0, 100) : '';
    const facings = typeof item.NumberFacings === 'number' ? 
      Math.max(0, Math.min(1000, Math.round(item.NumberFacings))) : 
      (parseInt(item.NumberFacings) || 0);
    
    // Safe price parsing with fallback
    let price = 0;
    if (typeof item.PriceSKU === 'string') {
      const priceString = item.PriceSKU.replace(/[^0-9.]/g, '');
      price = parseFloat(priceString) || 0;
      // Sanitize: Ensure price is reasonable (between 0 and 1,000,000)
      price = Math.max(0, Math.min(1000000, price));
    }
    
    const position = typeof item.ShelfSection === 'string' ? item.ShelfSection.substring(0, 100) : '';
    
    // Get confidence level with validation
    let confidence = 'unknown';
    if (item.BoundingBox && typeof item.BoundingBox.confidence === 'number') {
      const conf = item.BoundingBox.confidence;
      // Clamp confidence value
      const clampedConf = Math.max(0, Math.min(1, conf));
      if (clampedConf >= 0.9) confidence = 'high';
      else if (clampedConf >= 0.7) confidence = 'mid';
      else confidence = 'low';
    }
    
    // Determine empty space estimate
    let emptySpaceEstimate;
    if (item.OutofStock === true) {
      emptySpaceEstimate = 100;
    }
    
    return {
      sku_name: skuName,
      brand: brand,
      sku_count: facings,
      sku_price: price,
      sku_position: position,
      sku_confidence: confidence,
      empty_space_estimate: emptySpaceEstimate
    };
  }).filter(Boolean); // Filter out any null entries
}
