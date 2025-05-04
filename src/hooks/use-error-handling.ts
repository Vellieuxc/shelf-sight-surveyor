
import { useCallback } from 'react';
import { handleError, ErrorOptions, FormattedError, ErrorContext } from '@/utils/errors';

/**
 * Hook that provides error handling capabilities to components
 */
export function useErrorHandling(defaultContext?: Partial<ErrorContext>) {
  /**
   * Handle an error with the provided options
   */
  const handleComponentError = useCallback(
    (error: unknown, options: Partial<ErrorOptions> = {}) => {
      return handleError(error, {
        ...options,
        context: {
          ...defaultContext,
          ...options.context,
          // Properly merge additionalData if provided in both places
          additionalData: {
            ...(defaultContext?.additionalData || {}),
            ...(options.context?.additionalData || {}),
            ...(options.additionalData || {})
          }
        }
      });
    },
    [defaultContext]
  );

  /**
   * Create a wrapped async function with built-in error handling
   */
  const withComponentErrorHandling = useCallback(
    <T>(fn: (...args: any[]) => Promise<T>, options: Partial<ErrorOptions> = {}) => {
      return async (...args: any[]): Promise<T | undefined> => {
        try {
          return await fn(...args);
        } catch (error) {
          handleComponentError(error, options);
          return undefined;
        }
      };
    },
    [handleComponentError]
  );

  /**
   * Run an async function with built-in error handling
   */
  const runSafely = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      options: Partial<ErrorOptions> = {}
    ): Promise<{ data: T | undefined; error: FormattedError | null }> => {
      try {
        const data = await asyncFn();
        return { data, error: null };
      } catch (error) {
        const formattedError = handleComponentError(error, options);
        return { data: undefined, error: formattedError };
      }
    },
    [handleComponentError]
  );

  return {
    handleError: handleComponentError,
    withErrorHandling: withComponentErrorHandling,
    runSafely,
  };
}
