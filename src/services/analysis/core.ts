
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";
import { AnalysisOptions, AnalysisResponse } from "./types";

/**
 * Invokes the edge function to analyze a shelf image
 * 
 * @param imageUrl URL of the image to analyze
 * @param imageId Identifier for the image
 * @param options Configuration options for the analysis
 */
export async function invokeAnalysisFunction(
  imageUrl: string,
  imageId: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResponse> {
  const { includeConfidence = true } = options;
  
  console.log(`Invoking analyze-shelf-image edge function for image ${imageId}`);
  console.log(`Using image URL: ${imageUrl}`);
  
  try {
    // Invoke the edge function
    const { data: response, error } = await supabase.functions.invoke('analyze-shelf-image', {
      body: {
        imageUrl,
        imageId,
        includeConfidence
      }
    });
    
    // Handle edge function errors
    if (error) {
      console.error(`Error from edge function:`, error);
      throw error;
    }
    
    console.log("Response from edge function:", response);
    
    // Validate response
    if (!response) {
      throw new Error("No response received from analysis function");
    }
    
    // Add a summary item with total facings if not present
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const totalFacings = response.data.reduce((sum, item) => {
        // Only count items that are not empty spaces
        return sum + (item.empty_space_estimate === undefined ? (item.sku_count || 0) : 0);
      }, 0);
      
      // Add a summary item if not already present
      const hasSummary = response.data.some(item => item.total_sku_facings !== undefined);
      
      if (!hasSummary) {
        response.data.push({
          sku_name: "Summary",
          brand: "",
          sku_count: 0,
          sku_price: 0,
          total_sku_facings: totalFacings,
          quality_picture: "Good"
        });
      }
    }
    
    return response as AnalysisResponse;
    
  } catch (error) {
    console.error("Error invoking analysis function:", error);
    throw error;
  }
}
