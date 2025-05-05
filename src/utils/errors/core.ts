
import { extractErrorMessage } from './extractors';
import { showErrorToast } from './toasts';
import { ErrorOptions, FormattedError, ErrorContext } from './types';

/**
 * Handle errors consistently throughout the application
 * 
 * @param error The error object to handle
 * @param options Configuration options for error handling
 * @returns A formatted error object with context
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
    title,
    description,
    // Handle direct properties for backward compatibility
    operation,
    additionalData,
    variant
  } = options;
  
  // Merge direct properties into context for backward compatibility
  const finalContext = {
    ...context,
    operation: operation ?? context.operation,
    additionalData: additionalData ?? context.additionalData
  };
  
  // Extract error message
  const errorMessage = extractErrorMessage(error, fallbackMessage);
  
  // Use provided title/description or generate from context
  const toastTitle = title ?? `Error: ${finalContext.operation}`;
  const toastDescription = description ?? errorMessage;
  
  // Determine which variant to use (giving priority to toastVariant)
  const finalVariant = toastVariant || variant || "destructive";
  
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
      title: toastTitle,
      message: toastDescription,
      variant: finalVariant,
      useShadcnToast,
      retry
    });
  }
  
  return errorWithContext;
}

/**
 * Create a wrapped async function with built-in error handling
 * 
 * @param fn The async function to wrap
 * @param options Error handling options
 * @returns A wrapped function with error handling
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

/**
 * Function to safely run an async function with appropriate error handling
 * 
 * @param asyncFn The async function to execute
 * @param errorOptions Error handling options
 * @returns Promise resolving to the function result or undefined on error
 */
export async function safeAsync<T>(
  asyncFn: () => Promise<T>, 
  errorOptions: ErrorOptions
): Promise<T | undefined> {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, errorOptions);
    return undefined;
  }
}
