
import { useState, useEffect } from 'react';

interface CacheEntry {
  data: any;
  timestamp: number;
}

// Simple in-memory cache
const cache: Record<string, CacheEntry> = {};

// Default time-to-live for cache entries (in milliseconds)
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

interface UseAnalysisCacheOptions {
  ttl?: number;
  enabled?: boolean;
}

/**
 * A hook for caching expensive computations like image analysis
 * 
 * @param key The cache key (must be unique for the computation)
 * @param computation The function that performs the computation
 * @param options Cache configuration options
 * @returns The cached result or the result of a new computation
 */
export function useAnalysisCache<T>(
  key: string,
  computation: () => Promise<T>,
  options: UseAnalysisCacheOptions = {}
): {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  invalidateCache: () => void;
  executeComputation: () => Promise<T>;
} {
  const { ttl = DEFAULT_TTL, enabled = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Check if we have a valid cached entry
  const getCachedEntry = (cacheKey: string): T | null => {
    const entry = cache[cacheKey];
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > ttl) {
      // Entry has expired
      delete cache[cacheKey];
      return null;
    }
    
    return entry.data;
  };
  
  // Function to execute the computation and cache the result
  const executeComputation = async (): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await computation();
      
      // Cache the result if caching is enabled
      if (enabled) {
        cache[key] = {
          data: result,
          timestamp: Date.now()
        };
      }
      
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load data on initial render if we don't have it in cache
  useEffect(() => {
    const cachedData = enabled ? getCachedEntry(key) : null;
    
    if (cachedData) {
      setData(cachedData);
      return;
    }
    
    // If no cached data and key is provided, execute the computation
    if (key) {
      executeComputation().catch(err => {
        console.error('Error executing cached computation:', err);
      });
    }
  }, [key]);
  
  // Function to invalidate the cache entry
  const invalidateCache = () => {
    if (key in cache) {
      delete cache[key];
    }
    
    // Re-execute the computation to get fresh data
    executeComputation().catch(err => {
      console.error('Error refreshing data:', err);
    });
  };
  
  return { 
    data, 
    isLoading, 
    error, 
    invalidateCache,
    executeComputation 
  };
}
