
/**
 * OCR Analysis Service
 * 
 * This module provides a simplified interface to the OCR analyzer
 * for analyzing shelf images and extracting product information.
 */

import { AnalysisOptions, AnalysisResponse } from "./types";
import { invokeOcrAnalysis } from "./ocr_api_connector";

/**
 * Analyze a shelf image using OCR
 * 
 * @param imageUrl URL of the image to analyze
 * @param imageId Identifier for the image
 * @param options Configuration options
 * @returns Promise resolving to analysis results
 */
export async function analyzeWithOcr(
  imageUrl: string,
  imageId: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResponse> {
  try {
    console.log(`Starting OCR analysis for image: ${imageId}`);
    
    // Input validation
    if (!imageUrl) {
      throw new Error("Image URL is required");
    }
    
    if (!imageId) {
      throw new Error("Image ID is required");
    }
    
    // Call the OCR API connector
    const response = await invokeOcrAnalysis(imageUrl, imageId, options);
    
    console.log(`OCR analysis completed for image ${imageId}`);
    
    return response;
    
  } catch (error) {
    console.error(`OCR analysis failed:`, error);
    
    return {
      success: false,
      jobId: `ocr-error-${Date.now()}`,
      status: 'error',
      data: [],
      error: error instanceof Error ? error.message : 'Unknown OCR analysis error'
    };
  }
}

/**
 * Get OCR analysis status
 * This is a stub for API compatibility - OCR analysis is synchronous in this implementation
 */
export function getOcrAnalysisStatus(jobId: string): Promise<AnalysisResponse> {
  return Promise.resolve({
    success: true,
    jobId,
    status: 'completed',
    data: []
  });
}
