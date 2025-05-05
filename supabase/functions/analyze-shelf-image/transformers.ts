
// Transform raw Claude analysis data into our application format
export function transformAnalysisData(analysisData: any[]): any[] {
  try {
    if (!Array.isArray(analysisData)) {
      console.error("Analysis data is not an array");
      return [];
    }
    
    // Map Claude's response to our expected structure
    const transformedData = analysisData.map(item => ({
      brand: item.brand || "",
      sku_name: item.product || "",  // Map 'product' to 'sku_name'
      sku_count: parseInt(item.visibility) || 1,  // Use visibility as sku_count, ensure it's a number
      sku_price: 0,  // Default price
      sku_position: item.position || "",
      sku_confidence: "high",  // Default confidence
      color: item.color || "",  // Include color information
      package_size: item.package_size || ""  // Include package size information
    }));
    
    // Calculate total count for summary
    const totalCount = transformedData.reduce((sum, item) => sum + (item.sku_count || 0), 0);
    
    // Add summary item
    transformedData.push({
      brand: "",
      sku_name: "Summary",
      sku_count: 0,
      sku_price: 0,
      quality_picture: "Good",
      total_sku_facings: totalCount
    });
    
    console.log(`Transformed ${transformedData.length - 1} products with total facings: ${totalCount}`);
    return transformedData;
  } catch (error) {
    console.error("Error transforming analysis data:", error);
    return [];
  }
}
