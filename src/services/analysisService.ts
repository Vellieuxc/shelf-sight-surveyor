
import { AnalysisData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";

export interface AnalysisOptions {
  retryCount?: number;
  timeout?: number;
  includeConfidence?: boolean;
}

export async function analyzeShelfImage(
  imageUrl: string, 
  imageId: string, 
  options: AnalysisOptions = {}
): Promise<AnalysisData[]> {
  const { 
    retryCount = 3, 
    timeout = 120000, // Increased timeout to 2 minutes for larger images
    includeConfidence = true 
  } = options;
  
  // Add timeout logic
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Analysis timed out")), timeout);
  });
  
  // Add retry logic
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retryCount} to analyze image ${imageId}`);
      
      const { data, error } = await Promise.race([
        supabase.functions.invoke('analyze-shelf-image', {
          body: {
            imageUrl,
            imageId,
            includeConfidence
          }
        }),
        timeoutPromise
      ]);
      
      if (error) throw error;
      
      if (data?.success && data.data) {
        console.log(`Image analysis successful on attempt ${attempt + 1}`);
        return data.data;
      }
      
      throw new Error("Invalid response format from analysis function");
    } catch (error) {
      // Format error message with attempt information
      const enhancedError = new Error(`Analysis attempt ${attempt + 1} failed`);
      
      // On last attempt, throw the error to be handled by caller
      if (attempt === retryCount - 1) {
        handleError(error, {
          silent: false, 
          fallbackMessage: `Image analysis failed after ${retryCount} attempts`, 
          context: {
            source: 'api',
            operation: 'analyzeShelfImage',
            additionalData: { imageId, attempt: retryCount }
          }
        });
        throw enhancedError;
      }
      
      // Log the error but continue with retry
      handleError(error, {
        silent: true, 
        showToast: false,
        logToService: true,
        context: {
          source: 'api',
          operation: 'analyzeShelfImage',
          additionalData: { imageId, attempt: attempt + 1, willRetry: true }
        }
      });
      
      // Wait before retrying - increase wait time with each attempt
      const backoffTime = Math.min(2000 * Math.pow(2, attempt), 10000); // Exponential backoff with max 10s
      console.log(`Waiting ${backoffTime}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error("All analysis attempts failed");
}
