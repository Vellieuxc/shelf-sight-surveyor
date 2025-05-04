
import { AnalysisData } from "@/types";
import { Json } from "@/integrations/supabase/types";

/**
 * Transforms raw JSON data from Supabase into strongly-typed AnalysisData objects
 * @param data Raw JSON data from Supabase
 * @returns Array of properly typed AnalysisData objects
 */
export function transformAnalysisData(data: Json[]): AnalysisData[] {
  return data.map(item => {
    // Handle case where item might be a string (parse it)
    const dataObject = typeof item === 'string' ? JSON.parse(item) : item;
    
    return {
      sku_name: dataObject.sku_name || '',
      brand: dataObject.brand || '',
      sku_count: Number(dataObject.sku_count) || 0,
      sku_price: Number(dataObject.sku_price) || 0,
      sku_price_pre_promotion: dataObject.sku_price_pre_promotion 
        ? Number(dataObject.sku_price_pre_promotion) 
        : undefined,
      sku_price_post_promotion: dataObject.sku_price_post_promotion 
        ? Number(dataObject.sku_price_post_promotion) 
        : undefined,
      sku_position: dataObject.sku_position as string | undefined,
      empty_space_estimate: dataObject.empty_space_estimate as number | undefined,
      sku_confidence: dataObject.sku_confidence as string | undefined,
      total_sku_facings: dataObject.total_sku_facings as number | undefined,
      quality_picture: dataObject.quality_picture as string | undefined
    };
  });
}
