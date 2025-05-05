
import { handleError } from "@/utils/errors";
import { invokeAnalysisFunction } from "./core";
import { AnalysisOptions, AnalysisResponse } from "./types";

/**
 * Handles retry logic for image analysis with exponential backoff
 * Improved for better error handling and diagnostics
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
    retryCount = 3, 
    timeout = 120000 // 2 minutes default timeout
  } = options;
  
  // Additional diagnostics for troubleshooting
  console.log(`Starting analysis for image ${imageId} with ${retryCount} retry attempts`);
  console.log(`Image URL: ${imageUrl}`);
  
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      console.log(`Attempt ${attempt + 1}/${retryCount} to analyze image ${imageId}`);
      
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
      
      // Invoke the analysis function
      const response = await invokeAnalysisFunction(imageUrl, imageId, options);
      
      // Clear the timeout if we complete successfully
      clearTimeout(timeoutId);
      
      // If already aborted, throw error
      if (isAborted) {
        throw new Error(`Analysis timed out after ${timeout}ms`);
      }
      
      // Check for errors in the response
      if (response.success === false) {
        throw new Error(response.error || "Analysis function returned an error");
      }
      
      console.log(`Image analysis successful on attempt ${attempt + 1}, found ${response.data?.length || 0} items`);
      return response;
      
    } catch (error: any) {
      // Format error message with attempt information
      const errorMessage = `Analysis attempt ${attempt + 1} failed: ${error.message || 'Unknown error'}`;
      console.error(errorMessage);
      
      // Enhanced diagnostics for errors
      console.log(`Error details:`, error);
      if (error.response) {
        try {
          const errorBody = await error.response.text();
          console.log(`Error response body:`, errorBody);
        } catch (e) {
          console.log(`Could not extract error response body`);
        }
      }
      
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
      
      // Wait before retrying - increase wait time with each attempt
      const backoffTime = Math.min(2000 * Math.pow(2, attempt), 10000); // Exponential backoff with max 10s
      console.log(`Waiting ${backoffTime}ms before retry ${attempt + 1}`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error("All analysis attempts failed");
}
