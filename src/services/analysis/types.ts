
/**
 * Configuration options for image analysis
 */
export interface AnalysisOptions {
  /**
   * Include confidence scores in the results
   * @default true
   */
  includeConfidence?: boolean;
  
  /**
   * Maximum time to wait for analysis (in milliseconds)
   * @default 120000 (2 minutes)
   */
  timeout?: number;
  
  /**
   * Maximum image size in bytes
   * @default 5 * 1024 * 1024 (5MB)
   */
  maxImageSize?: number;
  
  /**
   * Force reanalysis of the image even if existing data is available
   * @default false
   */
  forceReanalysis?: boolean;

  /**
   * Number of retry attempts for analysis operations
   * @default 3
   */
  retryCount?: number;
}

/**
 * Status of analysis job
 */
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'error';

/**
 * Response from analysis function
 */
export interface AnalysisResponse {
  /**
   * Whether the request was successful
   */
  success: boolean;
  
  /**
   * Unique identifier for the analysis job
   */
  jobId: string;
  
  /**
   * Status of the analysis job
   */
  status: AnalysisStatus;
  
  /**
   * Analysis results (if available)
   */
  data?: any;
  
  /**
   * Error message (if any)
   */
  error?: string;
}

