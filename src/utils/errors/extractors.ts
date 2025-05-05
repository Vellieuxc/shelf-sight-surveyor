
/**
 * Extract a readable message from various error types
 * 
 * @param error The error object
 * @param fallbackMessage Default message if extraction fails
 * @returns A human-readable error message
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string = "An unexpected error occurred"): string {
  if (!error) return fallbackMessage;
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }
  
  // Handle objects with message property
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, any>;
    
    // Check for common error message patterns
    if (errorObj.message && typeof errorObj.message === 'string') {
      return errorObj.message;
    }
    
    // Check for Supabase error format
    if (errorObj.error_description && typeof errorObj.error_description === 'string') {
      return errorObj.error_description;
    }
    
    // Check for nested error objects
    if (errorObj.error && typeof errorObj.error === 'object') {
      if (errorObj.error.message && typeof errorObj.error.message === 'string') {
        return errorObj.error.message;
      }
    }
    
    // Check for JSON stringified error
    try {
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}') {
        return stringified.length > 100 ? stringified.substring(0, 100) + '...' : stringified;
      }
    } catch (e) {
      // Ignore JSON stringify errors
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return fallbackMessage;
}

/**
 * Extract status code from various error types
 * 
 * @param error The error object
 * @returns The status code if available, otherwise undefined
 */
export function extractStatusCode(error: unknown): number | undefined {
  if (!error || typeof error !== 'object') return undefined;
  
  const errorObj = error as Record<string, any>;
  
  // Check direct status code
  if (typeof errorObj.status === 'number') {
    return errorObj.status;
  }
  
  if (typeof errorObj.statusCode === 'number') {
    return errorObj.statusCode;
  }
  
  // Check nested error object
  if (errorObj.error && typeof errorObj.error === 'object') {
    if (typeof errorObj.error.status === 'number') {
      return errorObj.error.status;
    }
    
    if (typeof errorObj.error.statusCode === 'number') {
      return errorObj.error.statusCode;
    }
  }
  
  return undefined;
}
