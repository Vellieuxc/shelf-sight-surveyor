
import { AnalysisData } from "@/types";

export interface AnalysisOptions {
  retryCount?: number;
  timeout?: number;
  includeConfidence?: boolean;
  sessionId?: string;
}

export interface AnalysisResponse {
  success: boolean;
  jobId: string;
  status?: string;
  data: AnalysisData[] | any[];
  error?: string;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  timeout?: number;
}
