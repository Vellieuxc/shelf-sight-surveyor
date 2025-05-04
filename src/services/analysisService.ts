
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
    timeout = 120000, // 2 minutes default timeout for larger images
    includeConfidence = true 
  } = options;
  
  // Add retry logic
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retryCount} to analyze image ${imageId}`);
      console.log(`Using image URL: ${imageUrl}`);
      
      // Create an AbortController for this request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Track if we've aborted to handle cleanup properly
      let isAborted = false;
      
      // Add abort listener
      controller.signal.addEventListener('abort', () => {
        isAborted = true;
        console.log('Analysis request aborted due to timeout');
      });
      
      // Make the request
      const functionPromise = supabase.functions.invoke('analyze-shelf-image', {
        body: {
          imageUrl,
          imageId,
          includeConfidence
        }
      });
      
      // Create a wrapper promise that we can resolve/reject based on the abort signal
      const result = await Promise.race([
        functionPromise,
        new Promise((_, reject) => {
          controller.signal.addEventListener('abort', () => {
            reject(new Error(`Analysis timed out after ${timeout}ms`));
          });
        })
      ]);
      
      // Clear the timeout if we complete successfully
      clearTimeout(timeoutId);
      
      // If already aborted, throw error (should not reach here but just in case)
      if (isAborted) {
        throw new Error(`Analysis timed out after ${timeout}ms`);
      }
      
      // Destructure result after we know we haven't aborted
      const { data, error } = result as any;
      
      if (error) {
        console.error(`Error from edge function:`, error);
        throw error;
      }
      
      if (data?.success && data.data) {
        console.log(`Image analysis successful on attempt ${attempt + 1}`);
        return data.data;
      }
      
      console.error("Invalid response format from analysis function:", data);
      throw new Error("Invalid response format from analysis function");
    } catch (error: any) {
      // Format error message with attempt information
      const enhancedError = new Error(`Analysis attempt ${attempt + 1} failed: ${error.message || 'Unknown error'}`);
      
      // Check if this was a timeout
      const isTimeout = error.name === 'AbortError' || 
                        error.message?.includes('timeout') ||
                        error.message?.includes('aborted');
                        
      // On last attempt, throw the error to be handled by caller
      if (attempt === retryCount - 1) {
        handleError(error, {
          silent: false, 
          fallbackMessage: isTimeout 
            ? `Image analysis timed out after ${retryCount} attempts. The image may be too complex.` 
            : `Image analysis failed after ${retryCount} attempts`, 
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
