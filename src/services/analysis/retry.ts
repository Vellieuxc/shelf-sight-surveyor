
import { handleError } from "@/utils/errors";
import { invokeAnalysisFunction } from "./core";
import { AnalysisOptions, AnalysisResponse } from "./types";

/**
 * Handles retry logic for image analysis with exponential backoff
 * Optimized for better performance and timeout handling
 * 
 * @param imageUrl URL of the image to analyze
 * @param imageId Identifier for the image
 * @param options Configuration options including retry settings
 * @returns Analysis response if successful
 * @throws Error if all retry attempts fail
 */
export async function executeWithRetry(
  imageUrl: string,
  imageId: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResponse> {
  const { 
    retryCount = 2, // Reduced from 3 to 2 for faster overall response
    timeout = 180000, // Increased from 120000 to 180000 (3 minutes)
    maxImageSize = 5 * 1024 * 1024 // 5MB default max size
  } = options;
  
  // Additional diagnostics for troubleshooting
  console.log(`Starting direct analysis for image ${imageId} with ${retryCount} retry attempts`);
  console.log(`Image URL: ${imageUrl}`);
  
  // Validate image URL before proceeding
  if (!imageUrl || !imageUrl.startsWith('http')) {
    throw new Error(`Invalid image URL format: ${imageUrl}`);
  }
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retryCount} to analyze image ${imageId}`);
      
      // Use a simple timeout promise instead of AbortController
      // This is more reliable for Supabase edge functions
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Analysis timed out after ${timeout}ms`)), timeout);
      });
      
      // Race between the actual analysis and the timeout
      const response = await Promise.race([
        invokeAnalysisFunction(imageUrl, imageId, {
          ...options,
          timeout,
          maxImageSize
        }),
        timeoutPromise
      ]);
      
      // Check for errors in the response
      if (response.success === false) {
        throw new Error(response.error || "Analysis function returned an error");
      }
      
      console.log(`Image analysis successful on attempt ${attempt + 1}, received data:`, 
        typeof response.data === 'object' ? 'object data' : typeof response.data);
      
      return response;
      
    } catch (error: any) {
      // Format error message with attempt information
      const errorMessage = `Analysis attempt ${attempt + 1} failed: ${error.message || 'Unknown error'}`;
      console.error(errorMessage);
      
      // On last attempt, throw the error to be handled by caller
      if (attempt === retryCount - 1) {
        handleError(error, {
          silent: false, 
          fallbackMessage: error.message?.includes('timeout') 
            ? `Image analysis timed out after ${retryCount} attempts. The image may be too complex.` 
            : `Image analysis failed after ${retryCount} attempts. Error: ${error.message}`, 
          context: {
            source: 'api',
            operation: 'analyzeShelfImage',
            additionalData: { imageId, attempt: retryCount }
          }
        });
        throw new Error(errorMessage);
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
      
      // Use shorter backoff times for faster response
      const backoffTime = Math.min(1000 * Math.pow(1.5, attempt), 5000); // Reduced wait times
      console.log(`Waiting ${backoffTime}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error("All analysis attempts failed");
}
