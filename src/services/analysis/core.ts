
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
  const { 
    includeConfidence = true,
    timeout = 120000,
    maxImageSize = 5 * 1024 * 1024
  } = options;
  
  console.log(`Invoking analyze-shelf-image edge function directly for image ${imageId}`);
  console.log(`Using image URL: ${imageUrl}`);
  
  // Enhanced input validation before sending to edge function
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
    // Pre-validate if image is accessible before sending to edge function
    try {
      console.log(`Pre-validating image access at: ${imageUrl}`);
      const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
      
      if (!imageResponse.ok) {
        throw new Error(`Image not accessible: HTTP ${imageResponse.status}`);
      }
      
      // Check content type
      const contentType = imageResponse.headers.get('content-type');
      if (contentType && !contentType.startsWith('image/')) {
        throw new Error(`URL doesn't point to an image: ${contentType}`);
      }
      
      // Check content length if available
      const contentLength = imageResponse.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > maxImageSize) {
        throw new Error(
          `Image too large: ${(parseInt(contentLength) / (1024 * 1024)).toFixed(2)}MB (max ${(maxImageSize / (1024 * 1024)).toFixed(2)}MB)`
        );
      }
      
      console.log(`Image pre-validation successful: ${contentType}`);
    } catch (imageError) {
      console.warn(`Image pre-validation warning: ${imageError.message}`);
      // Continue anyway as the edge function will handle the image fetch
    }
    
    // Invoke the edge function with direct analysis (no queuing)
    console.log(`Sending analysis request to edge function`);
    const { data: response, error } = await supabase.functions.invoke('analyze-shelf-image', {
      body: {
        imageUrl: imageUrl.trim(),
        imageId: imageId.trim(),
        includeConfidence,
        directAnalysis: true, // Signal to edge function to analyze directly
        maxImageSize
      }
    });
    
    // Handle edge function errors
    if (error) {
      console.error(`Error from edge function:`, error);
      throw error;
    }
    
    console.log("Direct response from analysis function:", response ? "received" : "null");
    
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
