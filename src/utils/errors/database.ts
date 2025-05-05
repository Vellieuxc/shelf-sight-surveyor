
import { handleError } from "./core";
import { ErrorOptions } from "./types";
import { toast } from "sonner";

/**
 * Specialized handler for database errors
 * 
 * @param error The error object
 * @param operation The operation that failed
 * @param options Additional options for error handling
 */
export function handleDatabaseError(
  error: unknown, 
  operation: string, 
  options: Omit<ErrorOptions, 'context'> = {}
) {
  let errorMessage = "Database operation failed";
  
  // Extract specific database error types
  if (error && typeof error === 'object') {
    const dbError = error as any;
    
    if (dbError.code === '23505') {
      errorMessage = "This record already exists (unique constraint violated)";
    } else if (dbError.code === '23503') {
      errorMessage = "Referenced record not found (foreign key constraint failed)";
    } else if (dbError.code === '42P01') {
      errorMessage = "Database table not found";
    } else if (dbError.message) {
      errorMessage = dbError.message;
    }
  }
  
  return handleError(error, {
    ...options,
    fallbackMessage: errorMessage,
    context: {
      source: 'database',
      operation,
      additionalData: options.additionalData
    },
  });
}
