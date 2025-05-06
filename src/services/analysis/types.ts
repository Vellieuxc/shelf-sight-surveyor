
// Import types from other files if needed
import { AnalysisData } from "@/types";

/**
 * Status of the analysis job
 */
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'error';

/**
 * Response from the analysis service
 */
export interface AnalysisResponse {
  success: boolean;
  jobId: string;
  status: AnalysisStatus;
  data: any; // The analyzed data, can be in different formats
  error?: string;
  processingTime?: number;
}

/**
 * Configuration options for the analysis request
 */
export interface AnalysisOptions {
  /**
   * Include confidence scores in the result
   * @default true
   */
  includeConfidence?: boolean;
  
  /**
   * Maximum time to wait for analysis to complete in milliseconds
   * @default 300000 (5 minutes)
   */
  timeout?: number;
  
  /**
   * Maximum allowed image size in bytes
   * @default 5242880 (5MB)
   */
  maxImageSize?: number;
  
  /**
   * Number of retry attempts if analysis fails
   * @default 2
   */
  retryCount?: number;
  
  /**
   * Force reanalysis even if cached data exists
   * @default false
   */
  forceReanalysis?: boolean;
}
