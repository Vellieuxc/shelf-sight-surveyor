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
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-id';
    let attempts = 0;

    const mockFunction = vi.fn().mockImplementation(async () => {
      attempts++;
      if (attempts === 1) {
        throw new Error('First attempt failed');
      }
      return { success: true, data: 'test data' };
    });

    const result = executeWithRetry(() => mockFunction(imageUrl, imageId));
    
    // Fast-forward timers
    await vi.runAllTimersAsync();
    
    const finalResult = await result;
    
    expect(attempts).toBe(2);
    expect(mockFunction).toHaveBeenCalledTimes(2);
    expect(finalResult).toEqual({ success: true, data: 'test data' });
  }, 10000);

  it('should throw error after all retry attempts fail', async () => {
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-id';
    
    const mockFunction = vi.fn().mockRejectedValue(new Error('Test error'));

    const retryPromise = executeWithRetry(() => mockFunction(imageUrl, imageId));
    
    // Fast-forward timers
    await vi.runAllTimersAsync();
    
    await expect(retryPromise).rejects.toThrow('Test error');
    expect(mockFunction).toHaveBeenCalledTimes(3); // Default 3 attempts
  }, 10000);

  it('should respect custom retry count', async () => {
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-id';
    const customRetryCount = 2;
    
    const mockFunction = vi.fn().mockRejectedValue(new Error('Test error'));

    const retryPromise = executeWithRetry(() => mockFunction(imageUrl, imageId), customRetryCount);
    
    // Fast-forward timers
    await vi.runAllTimersAsync();
    
    await expect(retryPromise).rejects.toThrow('Test error');
    expect(mockFunction).toHaveBeenCalledTimes(customRetryCount);
  }, 10000);
});
