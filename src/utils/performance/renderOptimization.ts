
/**
 * Component rendering performance optimization utilities
 */

import { useEffect, useRef } from 'react';
import { throttle } from 'lodash';

/**
 * Hook to detect slow renders and log them
 * @param componentName Name of the component to monitor
 * @param threshold Render time threshold in milliseconds
 */
export function useRenderPerformanceMonitor(componentName: string, threshold = 16) {
  const renderStartTime = useRef(performance.now());
  
  // Log slow renders in development only
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const renderTime = performance.now() - renderStartTime.current;
      
      if (renderTime > threshold) {
        console.warn(
          `[Performance] Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`
        );
      }
    }
    
    // Update the reference for the next render
    return () => {
      renderStartTime.current = performance.now();
    };
  });
}

/**
 * Hook to prevent excessive re-renders
 * @param value The value to check for changes
 * @param onExcessiveRenders Callback when excessive renders are detected
 * @param threshold Number of renders considered excessive in a short period
 */
export function useExcessiveRenderDetection(
  value: any,
  onExcessiveRenders?: () => void,
  threshold = 5
) {
  const renderCountRef = useRef(0);
  const previousValueRef = useRef(value);
  const timeWindowRef = useRef(Date.now());
  
  // Only run in development
  if (process.env.NODE_ENV !== 'production') {
    // Track renders and detect if they're happening too frequently
    renderCountRef.current += 1;
    
    // Check if we're in the same time window (1 second)
    const now = Date.now();
    if (now - timeWindowRef.current > 1000) {
      // Reset the counter if we're in a new time window
      renderCountRef.current = 1;
      timeWindowRef.current = now;
    } else if (renderCountRef.current > threshold) {
      // Log warning if renders exceed threshold
      console.warn(
        `[Performance] Excessive renders detected: ${renderCountRef.current} renders in 1 second`
      );
      
      // Call the callback if provided
      if (onExcessiveRenders) {
        onExcessiveRenders();
      }
    }
    
    // Store the current value for the next render
    previousValueRef.current = value;
  }
}

/**
 * Creates a throttled event handler that won't execute more than once in the given time period
 * @param handler The event handler function
 * @param delay Throttle delay in milliseconds
 */
export function useThrottledEventHandler<T extends (...args: any[]) => any>(
  handler: T,
  delay = 300
): T {
  const throttledHandler = useRef(throttle(handler, delay));
  
  // Update the throttled handler when the original handler changes
  useEffect(() => {
    throttledHandler.current = throttle(handler, delay);
    
    // Clean up the throttled function on unmount
    return () => {
      throttledHandler.current.cancel();
    };
  }, [handler, delay]);
  
  return throttledHandler.current as T;
}

/**
 * Hook to detect and warn about component prop changes that might cause unnecessary renders
 * @param props Component props
 * @param componentName Name of the component
 */
export function usePropChangeDetector(props: Record<string, any>, componentName: string) {
  const previousPropsRef = useRef<Record<string, any>>({});
  
  // Only run in development
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const changedProps: string[] = [];
      
      // Compare current props with previous props
      Object.keys(props).forEach(key => {
        if (props[key] !== previousPropsRef.current[key]) {
          changedProps.push(key);
        }
      });
      
      if (changedProps.length > 0) {
        console.debug(
          `[Props Changed] ${componentName}: ${changedProps.join(', ')}`
        );
      }
      
      // Update previous props
      previousPropsRef.current = { ...props };
    }
  });
}

/**
 * Helper function to log render time with component context
 * @param start Start time from performance.now()
 * @param componentName Name of the component
 * @param operationName Optional name of the operation
 */
export function logRenderTime(start: number, componentName: string, operationName?: string) {
  if (process.env.NODE_ENV !== 'production') {
    const duration = performance.now() - start;
    const operation = operationName ? ` (${operationName})` : '';
    console.debug(`[Render Time] ${componentName}${operation}: ${duration.toFixed(2)}ms`);
  }
}
