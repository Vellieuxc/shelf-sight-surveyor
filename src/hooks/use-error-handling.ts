
import { useCallback } from "react";
import { ErrorContext, ErrorOptions, handleError } from "@/utils/errors";

interface UseErrorHandlingProps extends Partial<ErrorContext> {}

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
        additionalData: {
          ...options.additionalData,
          componentName
        }
      }
    });
  }, [source, operation, componentName]);
  
  return { handleError: handleErrorWithContext };
}
