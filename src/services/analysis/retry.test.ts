
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeWithRetry } from './retry';
import { invokeAnalysisFunction } from './core';
import { handleError } from '@/utils/errors';
import { AnalysisStatus } from './types';

// Mock dependencies
vi.mock('./core', () => ({
  invokeAnalysisFunction: vi.fn()
}));

vi.mock('@/utils/errors', () => ({
  handleError: vi.fn()
}));

// Mock setTimeout to avoid waiting in tests
vi.useFakeTimers();

describe('executeWithRetry', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return the response on successful first attempt', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-success-image';
    
    const mockResponse = {
      success: true,
      jobId: 'test-job',
      status: 'completed' as AnalysisStatus,
      data: {
        metadata: { 
          total_items: 10,
          out_of_stock_positions: 2
        },
        shelves: [
          {
            position: 'top',
            items: [
              {
                position: 'top-left',
                product_name: 'Test Product',
                brand: 'Test Brand'
              }
            ]
          }
        ]
      }
    };
    
    // Mock successful invocation
    vi.mocked(invokeAnalysisFunction).mockResolvedValueOnce(mockResponse);
    
    // Execute the function
    const result = await executeWithRetry(imageUrl, imageId);
    
    // Assertions
    expect(result).toEqual(mockResponse);
    expect(invokeAnalysisFunction).toHaveBeenCalledTimes(1);
    expect(handleError).not.toHaveBeenCalled();
  });

  it('should retry when first attempt fails and succeed on second attempt', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-retry-image';
    const error = new Error('Network error');
    
    const mockResponse = {
      success: true,
      jobId: 'test-job',
      status: 'completed' as AnalysisStatus,
      data: {
        metadata: { 
          total_items: 10,
          out_of_stock_positions: 2
        },
        shelves: [
          {
            position: 'top',
            items: [
              {
                position: 'top-left',
                product_name: 'Test Product',
                brand: 'Test Brand'
              }
            ]
          }
        ]
      }
    };
    
    // Mock first attempt failure, second attempt success
    vi.mocked(invokeAnalysisFunction)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(mockResponse);
    
    // Execute the function
    const retryPromise = executeWithRetry(imageUrl, imageId);
    
    // Fast-forward the backoff timeout
    vi.runAllTimers();
    
    const result = await retryPromise;
    
    // Assertions
    expect(result).toEqual(mockResponse);
    expect(invokeAnalysisFunction).toHaveBeenCalledTimes(2);
    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('should throw error after all retry attempts fail', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-all-fail-image';
    const error = new Error('Network error');
    
    // Mock all attempts to fail
    vi.mocked(invokeAnalysisFunction)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error);
    
    // Execute the function and expect it to throw
    const retryPromise = executeWithRetry(imageUrl, imageId);
    
    // Fast-forward all timeouts
    vi.runAllTimers();
    vi.runAllTimers();
    
    await expect(retryPromise).rejects.toThrow('Analysis attempt 3 failed: Network error');
    expect(invokeAnalysisFunction).toHaveBeenCalledTimes(3);
    expect(handleError).toHaveBeenCalledTimes(3);
  });

  it('should respect custom retry count', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-custom-retry';
    const error = new Error('Network error');
    
    // Mock all attempts to fail
    vi.mocked(invokeAnalysisFunction)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error);
    
    // Execute with custom retry count
    const retryPromise = executeWithRetry(imageUrl, imageId, { retryCount: 3 });
    
    // Fast-forward all timeouts
    vi.runAllTimers();
    vi.runAllTimers();
    vi.runAllTimers();
    
    await expect(retryPromise).rejects.toThrow('Analysis attempt 4 failed: Network error');
    expect(invokeAnalysisFunction).toHaveBeenCalledTimes(4);
  });
});
