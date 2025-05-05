
import { handleError } from "./core";
import { ErrorOptions } from "./types";

/**
 * Specialized handler for storage errors
 * 
 * @param error The error object
 * @param operation The operation that failed
 * @param options Additional options for error handling
 */
export function handleStorageError(
  error: unknown, 
  operation: string, 
  options: Omit<ErrorOptions, 'context'> = {}
) {
  let errorMessage = "Storage operation failed";
  
  // Extract specific storage error types
  if (error && typeof error === 'object') {
    const storageError = error as any;
    
    if (storageError.statusCode === 403) {
      errorMessage = "Permission denied - you don't have access to this resource";
    } else if (storageError.statusCode === 404) {
      errorMessage = "File not found";
    } else if (storageError.statusCode === 413) {
      errorMessage = "File too large to upload";
    } else if (storageError.message) {
      errorMessage = storageError.message;
    }
  }
  
  return handleError(error, {
    ...options,
    fallbackMessage: errorMessage,
    context: {
      source: 'storage',
      operation,
      additionalData: options.additionalData
    },
  });
}
