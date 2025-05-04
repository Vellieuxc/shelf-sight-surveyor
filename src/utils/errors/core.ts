
import { extractErrorMessage } from './extractors';
import { showErrorToast } from './toasts';
import { ErrorOptions, FormattedError, ErrorContext } from './types';

// Re-export types for convenience
export type { ErrorSource, ErrorContext, ErrorOptions, FormattedError } from './types';

/**
 * Handle errors consistently throughout the application
 */
export function handleError(error: unknown, options: ErrorOptions = {}): FormattedError {
  const {
    silent = false,
    fallbackMessage = "An unexpected error occurred",
    showToast = true,
    logToService = true,
    toastVariant = "destructive",
    useShadcnToast = false, 
    context = { source: 'unknown', operation: 'unknown operation' },
    retry,
    // Handle direct properties for backward compatibility
    operation,
    additionalData
  } = options;
  
  // Merge direct properties into context for backward compatibility
  const finalContext = {
    ...context,
    operation: operation ?? context.operation,
    additionalData: additionalData ?? context.additionalData
  };
  
  // Extract error message
  const errorMessage = extractErrorMessage(error, fallbackMessage);
  
  // Format error context for logging
  const errorWithContext = {
    message: errorMessage,
    originalError: error,
    context: finalContext
  };
  
  // Log to console (with context)
  if (!silent) {
    console.error(`Error in ${finalContext.source} during ${finalContext.operation}:`, error);
    if (finalContext.additionalData) {
      console.error("Additional context:", finalContext.additionalData);
    }
  }
  
  // Log to error monitoring service
  if (logToService) {
    // Implementation for error monitoring service (e.g., Sentry)
    // This would be implemented when you add an error monitoring service
    // Example: Sentry.captureException(error, { extra: context });
  }
  
  // Show toast notification
  if (showToast) {
    showErrorToast({
      title: `Error: ${finalContext.operation}`,
      message: errorMessage,
      variant: toastVariant,
      useShadcnToast,
      retry
    });
  }
  
  return errorWithContext;
}

/**
 * Create a wrapped async function with built-in error handling
 */
export function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>,
  options: ErrorOptions
): (...args: any[]) => Promise<T | undefined> {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      return undefined;
    }
  };
}
