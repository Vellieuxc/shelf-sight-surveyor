
import { handleError, ErrorOptions, FormattedError } from './core';

/**
 * Specific handler for Supabase database errors
 */
export function handleDatabaseError(
  error: unknown, 
  operation: string, 
  options: Omit<ErrorOptions, "context"> = {}
): FormattedError {
  return handleError(error, {
    ...options,
    fallbackMessage: `Database operation failed: ${operation}`,
    context: {
      source: 'database',
      operation,
      additionalData: options.additionalData
    }
  });
}
