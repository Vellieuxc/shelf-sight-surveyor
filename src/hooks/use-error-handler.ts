
import { useCallback } from "react";
import { 
  handleError, 
  ErrorOptions, 
  ErrorContext, 
  FormattedError,
  ErrorSource 
} from "@/utils/errors";

interface UseErrorHandlingConfig {
  source: ErrorSource;
  componentName?: string;
  operation?: string;
  additionalData?: Record<string, unknown>;
  silent?: boolean;
  showToast?: boolean;
  logToService?: boolean;
}

export const useErrorHandling = (config: UseErrorHandlingConfig = { source: 'unknown' }) => {
  const baseContext: ErrorContext = {
    source: config.source,
    operation: config.operation || 'unknown operation',
    componentName: config.componentName,
    additionalData: config.additionalData
  };

  const handleErrorWithContext = useCallback((
    error: unknown, 
    options: Omit<ErrorOptions, 'context'> = {}
  ): FormattedError => {
    return handleError(error, {
      silent: config.silent,
      showToast: config.showToast,
      logToService: config.logToService,
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
    config.silent, 
    config.showToast, 
    config.logToService
  ]);

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
};
