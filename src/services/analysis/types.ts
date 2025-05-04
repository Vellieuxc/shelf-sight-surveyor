
/**
 * Options for configuring the image analysis process
 */
export interface AnalysisOptions {
  /** Number of retry attempts if analysis fails (default: 3) */
  retryCount?: number;
  /** Maximum time in milliseconds before timing out (default: 120000) */
  timeout?: number;
  /** Whether to include confidence scores in results (default: true) */
  includeConfidence?: boolean;
}

/**
 * Response format from the analyze-shelf-image edge function
 */
export interface AnalysisResponse {
  success: boolean;
  data?: any[];
  error?: string;
}
