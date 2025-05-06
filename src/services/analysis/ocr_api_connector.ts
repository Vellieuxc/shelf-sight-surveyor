
/**
 * OCR API Connector
 * 
 * Provides an interface to connect to the Python OCR analyzer API.
 * This module handles communication between the frontend and the OCR service.
 */

import { AnalysisOptions, AnalysisResponse } from "./types";

// Configuration for the OCR API endpoint
const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || 'http://localhost:8000/analyze';

/**
 * Sends an image to the OCR analyzer API for processing
 * 
 * @param imageUrl URL of the image to analyze
 * @param imageId Identifier for the image
 * @param options Configuration options
 * @returns Promise resolving to the analysis response
 */
export async function invokeOcrAnalysis(
  imageUrl: string,
  imageId: string,
  options: AnalysisOptions = {}
): Promise<AnalysisResponse> {
  console.log(`Invoking OCR analysis for image ${imageId}`);
  
  try {
    // Prepare the request to the OCR API
    const response = await fetch(OCR_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageUrl,
        imageId,
        options: {
          includeConfidence: options.includeConfidence || false,
          timeout: options.timeout || 30000,
          maxImageSize: options.maxImageSize || 5 * 1024 * 1024
        }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OCR API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    // Return in the format expected by the application
    return {
      success: data.success,
      jobId: data.jobId || `ocr-${Date.now()}`,
      status: data.status || 'completed',
      data: data.data || [],
      error: data.error
    };
    
  } catch (error) {
    console.error('Error invoking OCR analysis:', error);
    
    // Return a standardized error response
    return {
      success: false,
      jobId: `ocr-error-${Date.now()}`,
      status: 'error',
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error during OCR analysis'
    };
  }
}
