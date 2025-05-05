
/**
 * Analysis Service
 * 
 * Centralized module for handling shelf image analysis with direct function calls,
 * error handling, and data transformation.
 */

import { AnalysisData } from "@/types";
import { AnalysisOptions, AnalysisResponse } from "./types";
import { executeWithRetry } from "./retry";
import { transformAnalysisResult } from "./transformers";

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
  const response = await executeWithRetry(imageUrl, imageId, options);
  return transformAnalysisResult(response);
}

// Export types and all functions
export * from "./types";
export * from "./core";
export * from "./retry";
export * from "./transformers";
