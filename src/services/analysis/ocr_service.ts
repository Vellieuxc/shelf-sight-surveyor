
/**
 * OCR Analysis Service
 * 
 * This module provides a simplified interface to the OCR analyzer
 * for analyzing shelf images and extracting product information.
 */

import { AnalysisOptions, AnalysisResponse } from "./types";
import { invokeOcrAnalysis } from "./ocr_api_connector";

/**
 * Check if the image has already been analyzed
 * 
 * @param analysisData Existing analysis data
 * @returns boolean indicating whether the image already has analysis data
 */
function hasExistingAnalysis(analysisData: any): boolean {
  return !!analysisData && 
         (Array.isArray(analysisData) ? analysisData.length > 0 : 
          typeof analysisData === 'object' && Object.keys(analysisData).length > 0);
}

/**
 * Analyze a shelf image using OCR
 * 
 * @param imageUrl URL of the image to analyze
 * @param imageId Identifier for the image
 * @param options Configuration options
 * @param existingData Optional existing analysis data
 * @returns Promise resolving to analysis results
 */
export async function analyzeWithOcr(
  imageUrl: string,
  imageId: string,
  options: AnalysisOptions = {},
  existingData: any = null
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

    // If we already have existing analysis data and no reanalysis is requested
    if (hasExistingAnalysis(existingData) && !options.forceReanalysis) {
      console.log(`Using existing analysis data for image ${imageId}`);
      return {
        success: true,
        jobId: `ocr-existing-${Date.now()}`,
        status: 'completed',
        data: existingData
      };
    }
    
    // Call the OCR API connector
    const response = await invokeOcrAnalysis(imageUrl, imageId, options);
    
    // Check if we got a successful response
    if (!response.success && hasExistingAnalysis(existingData)) {
      console.log(`OCR analysis failed, falling back to existing data for image ${imageId}`);
      return {
        success: true,
        jobId: `ocr-fallback-${Date.now()}`,
        status: 'completed',
        data: existingData
      };
    }
    
    console.log(`OCR analysis completed for image ${imageId}`);
    
    return response;
    
  } catch (error) {
    console.error(`OCR analysis failed:`, error);
    
    // If we have existing data, return it as a fallback
    if (hasExistingAnalysis(existingData)) {
      return {
        success: true,
        jobId: `ocr-fallback-${Date.now()}`,
        status: 'completed',
        data: existingData
      };
    }
    
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
