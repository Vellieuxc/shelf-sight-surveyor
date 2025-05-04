
import { AnalysisData } from "@/types";
import { AnalysisOptions } from "./types";
import { executeWithRetry } from "./retry";

/**
 * Analyzes a shelf image using the edge function with retry capabilities
 * 
 * @param imageUrl URL of the image to analyze
 * @param imageId Identifier for the image
 * @param options Configuration options for the analysis
 * @returns Promise resolving to analysis data if successful
 */
export async function analyzeShelfImage(
  imageUrl: string, 
  imageId: string, 
  options: AnalysisOptions = {}
): Promise<AnalysisData[]> {
  return executeWithRetry(imageUrl, imageId, options);
}

// Export types and all functions
export * from "./types";
export * from "./core";
export * from "./retry";
