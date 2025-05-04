
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
  
  console.log(`[DISABLED] Would invoke analyze-shelf-image edge function for image ${imageId}`);
  console.log(`Using image URL: ${imageUrl}`);
  
  // Return a mock response instead of calling the edge function
  return {
    success: true,
    data: [] // Empty data array
  };
  
  // Original code (commented out)
  /*
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
    
    return response as AnalysisResponse;
    
  } catch (error) {
    console.error("Error invoking analysis function:", error);
    throw error;
  }
  */
}
