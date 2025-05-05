
import { useCallback } from "react";
import { ErrorContext, ErrorOptions, FormattedError, handleError } from "@/utils/errors";

interface UseErrorHandlingProps extends Partial<ErrorContext> {
  componentName?: string;
}

/**
 * Hook to provide context-aware error handling
 */
export function useErrorHandling(props: UseErrorHandlingProps = {}) {
  const { source = 'unknown', operation, componentName } = props;
  
  const handleErrorWithContext = useCallback((
    error: unknown, 
    options: Omit<ErrorOptions, 'context'> = {}
  ) => {
    return handleError(error, {
      ...options,
      context: {
        source,
        operation: options.operation || operation || (componentName ? `${componentName}` : 'unknown operation'),
        componentName,
        additionalData: {
          ...options.additionalData,
        }
      }
    });
  }, [source, operation, componentName]);
  
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
