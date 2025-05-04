
import { handleError, ErrorOptions, FormattedError } from './core';

/**
 * Specific handler for Supabase storage errors
 */
export function handleStorageError(
  error: unknown, 
  operation: string, 
  options: Omit<ErrorOptions, "context"> = {}
): FormattedError {
  return handleError(error, {
    ...options,
    fallbackMessage: `Storage operation failed: ${operation}`,
    context: {
      source: 'storage',
      operation,
      additionalData: options.additionalData
    }
  });
}
