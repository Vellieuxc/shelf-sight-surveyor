
/**
 * Utility functions for monitoring and measuring performance
 */

// Monitor a function execution with timing and logging
export async function monitorClaudeCall<T>(fn: () => Promise<T>): Promise<T> {
  const startTime = performance.now();
  let result: T;
  
  try {
    result = await fn();
  } catch (error) {
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    console.error(`Claude call failed after ${duration}ms`, error);
    throw error;
  }
  
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  
  console.log(`Claude call completed in ${duration}ms`);
  return result;
}
