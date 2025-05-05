
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
  
  console.log(`Invoking analyze-shelf-image edge function for image ${imageId}`);
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
    // Invoke the edge function with validated inputs
    const { data: response, error } = await supabase.functions.invoke('analyze-shelf-image', {
      body: {
        imageUrl: imageUrl.trim(),
        imageId: imageId.trim(),
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
    
    // Check if the analysis was queued (new queue system)
    if (response.status === "queued" && response.jobId) {
      return await waitForAnalysisCompletion(imageId, response.jobId);
    }
    
    return response as AnalysisResponse;
    
  } catch (error) {
    console.error("Error invoking analysis function:", error);
    throw error;
  }
}

/**
 * Poll for analysis completion with enhanced security
 * 
 * @param imageId The image ID being analyzed
 * @param jobId The job ID from the queue
 * @returns Promise resolving to analysis response when complete
 */
async function waitForAnalysisCompletion(
  imageId: string,
  jobId: string
): Promise<AnalysisResponse> {
  const maxAttempts = 30; // Maximum 30 attempts
  const delayMs = 2000; // 2 seconds between polls
  
  console.log(`Waiting for analysis to complete for image ${imageId} (job ${jobId})`);
  
  // Function to delay execution
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // Input validation for security
  if (!imageId || typeof imageId !== 'string') {
    throw new Error("Valid image ID is required for status check");
  }
  
  // Poll for job completion
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Wait before checking
    await delay(delayMs);
    
    // Check job status - Using proper parameter structure for invoke
    const { data: response, error } = await supabase.functions.invoke('analyze-shelf-image/status', {
      body: { imageId }
    });
    
    if (error) {
      console.error(`Error checking job status (attempt ${attempt}):`, error);
      continue;
    }
    
    console.log(`Job status check (attempt ${attempt}):`, response);
    
    // Validate response before using it
    if (!response || typeof response !== 'object') {
      console.error(`Invalid response format on attempt ${attempt}`);
      continue;
    }
    
    // If job completed, validate and return results
    if (response.status === "completed" && response.data) {
      console.log(`Analysis completed for image ${imageId}`);
      
      // Validate the analysis result format
      if (!Array.isArray(response.data)) {
        throw new Error("Invalid analysis result format");
      }
      
      return response as AnalysisResponse;
    }
    
    // If job failed, throw error
    if (response.status === "failed") {
      throw new Error(`Analysis failed: ${response.message}`);
    }
    
    console.log(`Job still processing (status: ${response.status}), waiting...`);
  }
  
  // If we've hit max attempts
  throw new Error(`Analysis timed out after ${maxAttempts} attempts`);
}

/**
 * Manually trigger processing of the next job in the queue
 * Used for development and testing
 */
export async function processNextQueuedAnalysis(): Promise<void> {
  try {
    const { data, error } = await supabase.functions.invoke('analyze-shelf-image/process-next', {
      body: {}
    });
    
    if (error) {
      console.error("Error triggering queue processing:", error);
      throw error;
    }
    
    console.log("Queue processing response:", data);
  } catch (error) {
    console.error("Failed to trigger queue processing:", error);
    throw error;
  }
}
