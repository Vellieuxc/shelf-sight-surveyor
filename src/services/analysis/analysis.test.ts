
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeShelfImage } from './index';
import * as retry from './retry';
import * as transformers from './transformers';
import * as core from './core';

// Mock dependencies
vi.mock('./retry', () => ({
  executeWithRetry: vi.fn()
}));

vi.mock('./transformers', () => ({
  transformAnalysisResult: vi.fn(data => data.data || []),
  ensureAnalysisDataType: vi.fn(data => data)
}));

vi.mock('./core', () => ({
  invokeAnalysisFunction: vi.fn()
}));

describe('Image Analysis Service', () => {
  const mockImageUrl = 'https://example.com/test-image.jpg';
  const mockImageId = 'test-image-id-123';
  const mockResponse = {
    success: true,
    jobId: 'test-job-id', // Added required property
    status: 'completed',
    data: [
      { brand: 'Test Brand', sku_name: 'Test Product', sku_count: 3 }
    ]
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should analyze an image successfully through direct analysis', async () => {
    // Setup mocks for direct analysis flow
    vi.mocked(retry.executeWithRetry).mockResolvedValue(mockResponse);
    
    // Execute the function
    const result = await analyzeShelfImage(mockImageUrl, mockImageId);
    
    // Verify executeWithRetry is called with correct parameters
    expect(retry.executeWithRetry).toHaveBeenCalledWith(
      mockImageUrl, 
      mockImageId,
      expect.any(Object)
    );
    
    // Verify transformAnalysisResult formats the data
    expect(transformers.transformAnalysisResult).toHaveBeenCalledWith(mockResponse);
    
    // Verify the final result contains the expected data
    expect(result).toEqual(mockResponse.data);
  });
  
  it('should handle errors from executeWithRetry', async () => {
    // Setup mocks to simulate error
    const mockError = new Error('Test error');
    vi.mocked(retry.executeWithRetry).mockRejectedValue(mockError);
    
    // Execute and expect rejection
    await expect(analyzeShelfImage(mockImageUrl, mockImageId))
      .rejects.toThrow('Test error');
  });
  
  it('should pass options to executeWithRetry', async () => {
    // Setup mocks for a successful response
    vi.mocked(retry.executeWithRetry).mockResolvedValue(mockResponse);
    
    const options = { retryCount: 5, timeout: 30000 };
    
    // Execute the function with options
    await analyzeShelfImage(mockImageUrl, mockImageId, options);
    
    // Verify options were passed to executeWithRetry
    expect(retry.executeWithRetry).toHaveBeenCalledWith(
      mockImageUrl,
      mockImageId,
      options
    );
  });
});
