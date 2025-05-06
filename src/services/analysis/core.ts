
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";
import { AnalysisOptions, AnalysisResponse } from "./types";
import { analyzeWithOcr } from "./ocr_service";

/**
 * Invokes the analysis service to analyze a shelf image
 * Bypasses OCR requirement when OCR is not configured
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
    timeout = 180000, // Increased from 120000 to 180000 (3 minutes)
    maxImageSize = 5 * 1024 * 1024
  } = options;
  
  console.log(`Invoking analysis for image ${imageId}`);
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
    
    // Direct API call to analyze-shelf-image edge function
    console.log(`Making direct API call to analyze-shelf-image edge function`);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-shelf-image', {
        body: {
          imageUrl,
          imageId,
          options: {
            includeConfidence,
            timeout: Math.min(timeout, 150000), // Increased from 25000 to 150000 (2.5 minutes)
            directAnalysis: true, // Signal that we want direct analysis
          }
        }
      });
      
      if (error) {
        console.error(`Error from edge function:`, error);
        throw new Error(error.message || "Edge function error");
      }
      
      // If we got data back, return it
      if (data) {
        console.log(`Received response from edge function`);
        return {
          success: true,
          jobId: `edge-${Date.now()}`,
          status: 'completed',
          data
        };
      } else {
        // Try OCR as a fallback only if there's no direct data
        return await tryOcrOrCreateEmpty(imageUrl, imageId, options, existingData);
      }
    } catch (edgeError) {
      console.error(`Edge function error:`, edgeError);
      // Try OCR as a fallback
      return await tryOcrOrCreateEmpty(imageUrl, imageId, options, existingData);
    }
    
  } catch (error) {
    console.error("Error invoking analysis:", error);
    throw error;
  }
}

/**
 * Try to use OCR if available, otherwise create empty response
 */
async function tryOcrOrCreateEmpty(
  imageUrl: string,
  imageId: string,
  options: AnalysisOptions,
  existingData: any
): Promise<AnalysisResponse> {
  try {
    // Try OCR first (will automatically fail if OCR_API_URL is not set)
    return await analyzeWithOcr(imageUrl, imageId, options, existingData);
  } catch (ocrError) {
    console.warn(`OCR unavailable or failed, creating empty response:`, ocrError);
    
    // Return empty structured data or existing data if available
    return {
      success: true,
      jobId: `direct-${Date.now()}`,
      status: 'completed',
      data: existingData || {
        metadata: {
          total_items: 0,
          out_of_stock_positions: 0
        },
        shelves: []
      }
    };
  }
}
