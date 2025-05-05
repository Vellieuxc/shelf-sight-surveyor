
// Retry mechanism for handling transient failures

/**
 * Generic retry function for async operations with exponential backoff
 * 
 * @param fn Function to execute with retry capability
 * @param options Configuration for retry behavior
 * @returns Promise with the function result
 * @throws Last error encountered after all retries
 */
export async function callWithRetry<T>(
  fn: () => Promise<T>, 
  options: {
    maxRetries?: number;
    baseDelay?: number;
    retryableErrors?: string[] | ((error: Error) => boolean);
    onRetry?: (error: Error, attempt: number, delay: number) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    retryableErrors = ["ExternalServiceError"],
    onRetry = (error, attempt, delay) => console.log(`Retry attempt ${attempt}/${maxRetries} after ${delay}ms delay. Error: ${error.message}`)
  } = options;
  
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Determine if this error type should be retried
      let shouldRetry = false;
      
      if (typeof retryableErrors === "function") {
        shouldRetry = retryableErrors(error);
      } else if (Array.isArray(retryableErrors)) {
        shouldRetry = retryableErrors.includes(error.name) || 
                      retryableErrors.some(pattern => error.message?.includes(pattern));
      }
      
      // Don't retry if it's not a retryable error or last attempt
      if (!shouldRetry || attempt >= maxRetries) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt - 1);
      
      // Execute onRetry callback (typically for logging)
      onRetry(error, attempt, delay);
      
      // Wait before next retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never be reached due to the throw in the loop,
  // but typescript needs it for type safety
  throw lastError!;
}

/**
 * Specific retry configuration for Claude API calls
 * with custom error detection and logging
 */
export async function withClaudeRetry<T>(
  fn: () => Promise<T>,
  requestId: string
): Promise<T> {
  return callWithRetry(fn, {
    maxRetries: 3,
    baseDelay: 2000,
    retryableErrors: (error) => {
      // Retry on rate limits, timeouts, and temporary service errors
      return error.name === "ExternalServiceError" && (
        error.message.includes("rate limit") ||
        error.message.includes("timeout") ||
        error.message.includes("503") ||
        error.message.includes("429") ||
        error.message.includes("temporary")
      );
    },
    onRetry: (error, attempt, delay) => {
      console.log(`[${requestId}] Claude API retry attempt ${attempt} after ${delay}ms delay. Error: ${error.message}`);
    }
  });
}
