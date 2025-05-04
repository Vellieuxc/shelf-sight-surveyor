
/**
 * Utility functions for extracting information from errors
 */

/**
 * Extract a user-friendly error message from various error types
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  // Supabase error object
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // String error
  if (typeof error === 'string') {
    return error;
  }
  
  // JSON stringifiable error
  try {
    const errorStr = JSON.stringify(error);
    if (errorStr !== '{}' && errorStr !== 'null' && errorStr !== 'undefined') {
      return errorStr;
    }
  } catch {
    // If JSON stringify fails, fall back to default message
  }
  
  return fallbackMessage;
}
