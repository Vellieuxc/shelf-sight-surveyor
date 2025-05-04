
import { toast as sonnerToast } from "sonner";
import { toast as shadowToast } from "@/hooks/use-toast";

// Error types specific to your application
export type ErrorSource = 'auth' | 'database' | 'storage' | 'api' | 'ui' | 'unknown';

export interface ErrorContext {
  source: ErrorSource;
  operation: string;
  componentName?: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorOptions {
  silent?: boolean;
  fallbackMessage?: string;
  showToast?: boolean;
  logToService?: boolean;
  toastVariant?: "default" | "destructive";
  useShadcnToast?: boolean; // Whether to use shadcn/ui toast or sonner
  context?: ErrorContext;
  retry?: () => Promise<void>; // Optional retry function
  // Adding operation directly to ErrorOptions for backward compatibility
  operation?: string;
  // Adding additionalData directly to ErrorOptions for backward compatibility
  additionalData?: Record<string, unknown>;
}

export interface FormattedError {
  message: string;
  originalError: unknown;
  context?: ErrorContext;
}

/**
 * Extract a user-friendly error message from various error types
 */
function extractErrorMessage(error: unknown, fallbackMessage: string): string {
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
    useShadcnToast = false, // Default to sonner for toast since it's used in auth
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
    // Handle different toast libraries
    if (useShadcnToast) {
      shadowToast({
        title: `Error: ${finalContext.operation}`,
        description: errorMessage,
        variant: toastVariant
      });
    } else {
      // For retry functionality with sonner
      if (retry) {
        sonnerToast.error(errorMessage, {
          action: {
            label: 'Retry',
            onClick: () => retry(),
          },
        });
      } else {
        sonnerToast.error(errorMessage);
      }
    }
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
