
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";
import { AnalysisOptions, AnalysisResponse } from "./types";

/**
 * Invokes the edge function to analyze a shelf image
 * with enhanced input validation and security
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
  
  console.log(`Invoking analyze-shelf-image edge function directly for image ${imageId}`);
  console.log(`Using image URL: ${imageUrl}`);
  
  // Input validation before sending to edge function
  if (!imageUrl) {
    throw new Error("Image URL is required");
  }
  
  if (typeof imageUrl !== 'string') {
    throw new Error("Image URL must be a string");
  }
  
  try {
    new URL(imageUrl);
  } catch (e) {
    throw new Error("Invalid image URL format");
  }
  
  if (!imageId || typeof imageId !== 'string') {
    throw new Error("Valid image ID is required");
  }
  
  try {
    // Invoke the edge function with direct analysis (no queuing)
    const { data: response, error } = await supabase.functions.invoke('analyze-shelf-image', {
      body: {
        imageUrl: imageUrl.trim(),
        imageId: imageId.trim(),
        includeConfidence,
        directAnalysis: true // Signal to edge function to analyze directly
      }
    });
    
    // Handle edge function errors
    if (error) {
      console.error(`Error from edge function:`, error);
      throw error;
    }
    
    console.log("Direct response from analysis function:", response);
    
    // Validate response
    if (!response) {
      throw new Error("No response received from analysis function");
    }
    
    return response as AnalysisResponse;
    
  } catch (error) {
    console.error("Error invoking analysis function:", error);
    throw error;
  }
}

/**
 * REMOVED: waitForAnalysisCompletion - no longer needed as we're not queuing
 */

/**
 * REMOVED: processNextQueuedAnalysis - no longer needed as we're not queuing
 */
