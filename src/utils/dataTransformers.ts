
import { AnalysisData } from "@/types";

export const transformAnalysisData = (data: any[]): AnalysisData[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(item => {
    // Convert the item to an object if it's not already
    const obj = typeof item === 'object' && item !== null ? item : {};
    
    return {
      sku_name: String(obj.sku_name || ''),
      brand: String(obj.brand || ''),
      sku_count: Number(obj.sku_count || 0),
      sku_price: Number(obj.sku_price || 0),
      sku_price_pre_promotion: obj.sku_price_pre_promotion ? Number(obj.sku_price_pre_promotion) : undefined,
      sku_price_post_promotion: obj.sku_price_post_promotion ? Number(obj.sku_price_post_promotion) : undefined,
      empty_space_estimate: obj.empty_space_estimate ? Number(obj.empty_space_estimate) : undefined
    };
  });
};
