
import { handleError } from "@/utils/errors";
import { invokeAnalysisFunction } from "./core";
import { AnalysisOptions, AnalysisResponse, AnalysisStatus } from "./types";

/**
 * Handles retry logic for image analysis with optimized timeout handling
 * Refactored for better performance, reliability and error reporting
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
    timeout = 300000, // 5 minutes (300000ms) for large images
    maxImageSize = 5 * 1024 * 1024, // 5MB default max size
    retryCount = 2, // Default to 2 retries (3 attempts total)
    forceReanalysis = false
  } = options;
  
  console.log(`Starting analysis for image ${imageId} with ${retryCount} retry attempts`);
  
  // Validate image URL before proceeding
  if (!imageUrl || !imageUrl.startsWith('http')) {
    throw new Error(`Invalid image URL format: ${imageUrl}`);
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retryCount + 1; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retryCount + 1} to analyze image ${imageId}`);
      
      // Create a simple timeout promise rather than using AbortController
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Analysis timed out after ${timeout}ms`)), timeout);
      });
      
      // Race between the actual analysis and the timeout
      const response = await Promise.race([
        invokeAnalysisFunction(imageUrl, imageId, {
          ...options,
          timeout: Math.min(timeout, 270000), // Slightly shorter than our timeout
          maxImageSize,
          forceReanalysis
        }),
        timeoutPromise
      ]) as AnalysisResponse;
      
      // Check for errors in the response
      if (response.success === false) {
        throw new Error(response.error || "Analysis function returned an error");
      }
      
      console.log(`Image analysis successful on attempt ${attempt + 1}`);
      
      return response;
      
    } catch (error: any) {
      lastError = error;
      
      // Format error message with attempt information
      const errorMessage = `Analysis attempt ${attempt + 1} failed: ${error.message || 'Unknown error'}`;
      console.error(errorMessage);
      
      // On last attempt, throw the error to be handled by caller
      if (attempt === retryCount) {
        handleError(error, {
          silent: false, 
          fallbackMessage: error.message?.includes('timeout') 
            ? `Image analysis timed out after ${retryCount + 1} attempts. The image may be too complex.` 
            : `Image analysis failed after ${retryCount + 1} attempts. Error: ${error.message}`, 
          context: {
            source: 'api',
            operation: 'analyzeShelfImage',
            additionalData: { imageId, attempt: retryCount + 1 }
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
      
      // Use adaptive backoff - increase delay with each attempt
      const backoffTime = Math.min(1000 * Math.pow(1.5, attempt), 5000);
      console.log(`Waiting ${backoffTime}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw lastError || new Error("All analysis attempts failed");
}
