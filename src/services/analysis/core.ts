
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";
import { AnalysisOptions, AnalysisResponse } from "./types";
import { analyzeWithOcr } from "./ocr_service";

/**
 * Invokes the analysis service to analyze a shelf image
 * Now using the OCR-based analyzer
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
  
  console.log(`Invoking OCR-based analyzer for image ${imageId}`);
  console.log(`Using image URL: ${imageUrl}`);
  
  // Enhanced input validation before sending to the analyzer
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
    // Fetch existing analysis data as fallback
    let existingData = null;
    try {
      const { data: pictureData } = await supabase
        .from('pictures')
        .select('analysis_data')
        .eq('id', imageId)
        .single();
        
      existingData = pictureData?.analysis_data;
      if (existingData) {
        console.log(`Found existing analysis data for ${imageId}`);
      }
    } catch (fetchError) {
      console.warn(`Could not retrieve existing analysis data for ${imageId}:`, fetchError);
      // Continue without existing data
    }
    
    // Pre-validate if image is accessible
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
      // Continue anyway as the OCR service will handle the image fetch
    }
    
    // Use the OCR service for analysis
    console.log(`Sending analysis request to OCR service`);
    const response = await analyzeWithOcr(imageUrl, imageId, {
      includeConfidence,
      timeout,
      maxImageSize,
      forceReanalysis: options.forceReanalysis
    }, existingData);
    
    // Handle errors from OCR service
    if (!response.success) {
      console.error(`Error from OCR service:`, response.error);
      throw new Error(response.error || "Unknown error from OCR service");
    }
    
    console.log("Direct response from OCR analysis:", response ? "received" : "null");
    
    // Validate response
    if (!response) {
      throw new Error("No response received from OCR service");
    }
    
    return response;
    
  } catch (error) {
    console.error("Error invoking OCR analysis:", error);
    throw error;
  }
}
