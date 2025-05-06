
import { isEqual } from 'lodash';

/**
 * Creates a memoization comparison function for React.memo
 * that performs a deep comparison of props
 * 
 * @param excludedProps Props that should be excluded from comparison
 * @returns Comparison function for React.memo
 */
export function createDeepEqualityFn(excludedProps: string[] = []) {
  return (prevProps: any, nextProps: any) => {
    // Create copies without excluded props
    const filteredPrevProps = { ...prevProps };
    const filteredNextProps = { ...nextProps };
    
    excludedProps.forEach(prop => {
      delete filteredPrevProps[prop];
      delete filteredNextProps[prop];
    });
    
    // Perform deep comparison
    return isEqual(filteredPrevProps, filteredNextProps);
  };
}

/**
 * Type to extract props from a component
 */
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Helper function to safely measure component render time
 * @param componentName Name of the component
 * @param callback Function to execute
 */
export function measureRenderTime<T>(componentName: string, callback: () => T): T {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    const result = callback();
    const endTime = performance.now();
    console.log(`[Render Time] ${componentName}: ${(endTime - startTime).toFixed(2)}ms`);
    return result;
  }
  return callback();
}

/**
 * Create a debounced version of state setter
 * @param setState The state setter function
 * @param delay Delay in ms
 */
export function createDebouncedSetter<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  delay: number = 300
): (value: React.SetStateAction<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return (value: React.SetStateAction<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      setState(value);
    }, delay);
  };
}

/**
 * Create a throttled version of a function
 * @param fn Function to throttle
 * @param limit Throttle limit in ms
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
