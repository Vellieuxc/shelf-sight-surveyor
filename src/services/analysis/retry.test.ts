
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeWithRetry } from './retry';
import * as core from './core';

// Mock dependencies
vi.mock('./core', () => ({
  invokeAnalysisFunction: vi.fn()
}));

describe('Analysis Retry Service', () => {
  const mockImageUrl = 'https://example.com/test-image.jpg';
  const mockImageId = 'test-image-id-123';
  const mockResponse = {
    success: true,
    jobId: 'test-job-id',
    status: 'completed',
    data: {
      metadata: {
        total_items: 45,
        out_of_stock_positions: 8
      },
      shelves: [
        {
          position: "top",
          items: [
            {
              position: "top-left",
              product_name: "Brand X Cereal",
              brand: "Brand X"
            }
          ]
        }
      ]
    }
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(core.invokeAnalysisFunction).mockResolvedValue(mockResponse);
  });
  
  it('should retry failed requests up to the specified number of attempts', async () => {
    // Setup mock to fail twice then succeed
    vi.mocked(core.invokeAnalysisFunction)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce(mockResponse);
    
    const result = await executeWithRetry(mockImageUrl, mockImageId, { retryCount: 3 });
    
    // Should succeed after 3 attempts (2 failures + 1 success)
    expect(core.invokeAnalysisFunction).toHaveBeenCalledTimes(3);
    expect(result).toEqual(mockResponse);
  });
  
  it('should not retry if first attempt succeeds', async () => {
    const result = await executeWithRetry(mockImageUrl, mockImageId);
    
    expect(core.invokeAnalysisFunction).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockResponse);
  });
  
  it('should throw after exhausting all retry attempts', async () => {
    const mockError = new Error('Persistent error');
    vi.mocked(core.invokeAnalysisFunction).mockRejectedValue(mockError);
    
    await expect(executeWithRetry(mockImageUrl, mockImageId, { retryCount: 2 }))
      .rejects.toThrow('Persistent error');
    
    // Initial attempt + 2 retries = 3 calls
    expect(core.invokeAnalysisFunction).toHaveBeenCalledTimes(3);
  });
});
