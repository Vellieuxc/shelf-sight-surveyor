
import { useEffect, useRef } from 'react';
import { throttle } from 'lodash';

/**
 * Hook to monitor component render performance in development
 * @param componentName The name of the component to monitor
 */
export const useRenderPerformanceMonitor = (componentName: string): void => {
  const renderCount = useRef(0);
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      renderCount.current += 1;
      console.log(`[Render] ${componentName} rendered ${renderCount.current} times`);
    }
    
    return () => {
      if (process.env.NODE_ENV === 'development' && renderCount.current === 1) {
        console.log(`[Unmount] ${componentName} unmounted after ${renderCount.current} render`);
      }
    };
  });
};

/**
 * Creates a throttled event handler to prevent excessive function calls
 * @param callback The function to throttle
 * @param wait The throttle delay in ms
 */
export const useThrottledEventHandler = <T extends (...args: any[]) => any>(
  callback: T,
  wait: number = 200
): T => {
  const throttledFn = useRef<T>();
  
  useEffect(() => {
    throttledFn.current = throttle(callback, wait) as unknown as T;
  }, [callback, wait]);
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    return throttledFn.current?.(...args) as ReturnType<T>;
  }) as T;
};

/**
 * Hook to optimize event handlers in forms and UI elements
 * @param handler The event handler to optimize
 * @param deps Dependencies array for memoization
 */
export const useOptimizedEventHandler = <T extends (...args: any[]) => any>(
  handler: T,
  deps: React.DependencyList = []
): T => {
  const handleRef = useRef(handler);
  
  useEffect(() => {
    handleRef.current = handler;
  }, [handler, ...deps]);
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    return handleRef.current(...args);
  }) as T;
};
