
import { useCallback } from "react";
import { 
  ErrorContext, 
  ErrorOptions, 
  FormattedError,
  ErrorSource,
  handleError
} from "@/utils/errors";

interface UseErrorHandlingConfig {
  source?: ErrorSource;
  componentName?: string;
  operation?: string;
  additionalData?: Record<string, unknown>;
  silent?: boolean;
  showToast?: boolean;
  logToService?: boolean;
}

/**
 * Hook to provide context-aware error handling
 * 
 * @param config Configuration for the error handler
 * @returns Object containing error handling utilities
 */
export function useErrorHandling(config: UseErrorHandlingConfig = {}) {
  const { 
    source = 'unknown', 
    operation, 
    componentName,
    additionalData,
    silent,
    showToast,
    logToService
  } = config;
  
  // Base context for all error handling operations
  const baseContext: ErrorContext = {
    source,
    operation: operation || (componentName ? `${componentName}` : 'unknown operation'),
    componentName,
    additionalData
  };
  
  /**
   * Handle an error with the provided context
   */
  const handleErrorWithContext = useCallback((
    error: unknown, 
    options: Omit<ErrorOptions, 'context'> = {}
  ): FormattedError => {
    return handleError(error, {
      silent,
      showToast,
      logToService,
      toastVariant: options.variant || options.toastVariant,
      ...options,
      context: {
        ...baseContext,
        operation: options.operation || baseContext.operation,
        additionalData: { 
          ...baseContext.additionalData, 
          ...options.additionalData 
        }
      }
    });
  }, [
    baseContext, 
    silent, 
    showToast, 
    logToService
  ]);
  
  /**
   * Safely execute an async function with error handling
   */
  const runSafely = useCallback(async <T>(
    fn: () => Promise<T>,
    options: Omit<ErrorOptions, 'context'> = {}
  ): Promise<{ data?: T; error?: unknown }> => {
    try {
      const data = await fn();
      return { data };
    } catch (error) {
      handleErrorWithContext(error, options);
      return { error };
    }
  }, [handleErrorWithContext]);
  
  return { 
    handleError: handleErrorWithContext,
    runSafely
  };
}
