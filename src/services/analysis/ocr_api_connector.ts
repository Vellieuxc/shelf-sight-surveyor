
/**
 * OCR API Connector
 * 
 * Provides an interface to connect to the Python OCR analyzer API.
 * This module handles communication between the frontend and the OCR service.
 */

import { AnalysisOptions, AnalysisResponse } from "./types";

// Configuration for the OCR API endpoint
// If OCR API is not available, use null to indicate it's not accessible
const OCR_API_URL = import.meta.env.VITE_OCR_API_URL || null;

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
  
  // Check if OCR API URL is configured
  if (!OCR_API_URL) {
    console.warn('OCR API URL is not configured. Analysis will not be performed.');
    return {
      success: false,
      jobId: `ocr-unavailable-${Date.now()}`,
      status: 'error',
      data: [],
      error: 'OCR service is not configured or unavailable. Please set VITE_OCR_API_URL environment variable.'
    };
  }
  
  try {
    // Check if the service is reachable before making the actual request
    try {
      // Attempt a lightweight connection check
      const pingResponse = await fetch(OCR_API_URL, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(3000) // 3 second timeout for the ping
      });
      
      if (!pingResponse.ok) {
        throw new Error(`OCR service unavailable (HTTP ${pingResponse.status})`);
      }
    } catch (pingError) {
      console.warn('OCR service is not reachable:', pingError);
      throw new Error('OCR service is currently unavailable. Please try again later.');
    }
    
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
