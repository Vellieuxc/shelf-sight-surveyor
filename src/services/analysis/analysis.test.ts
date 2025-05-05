
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
  transformAnalysisResult: vi.fn(data => data.data?.data || []),
  ensureAnalysisDataType: vi.fn(data => data)
}));

vi.mock('./core', () => ({
  waitForAnalysisCompletion: vi.fn(),
  processNextQueuedAnalysis: vi.fn()
}));

describe('Image Analysis Service', () => {
  const mockImageUrl = 'https://example.com/test-image.jpg';
  const mockImageId = 'test-image-id-123';
  const mockJobId = 'test-job-id-456';
  const mockResponse = {
    success: true,
    jobId: mockJobId,
    data: {
      data: [
        { brand: 'Test Brand', sku_name: 'Test Product', sku_count: 3 }
      ]
    }
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    vi.resetAllMocks();
  });
  
  it('should analyze an image successfully through the full flow', async () => {
    // Setup mocks for the full flow
    vi.mocked(retry.executeWithRetry).mockResolvedValue({
      success: true,
      jobId: mockJobId,
      status: 'queued'
    });
    
    vi.mocked(core.waitForAnalysisCompletion).mockResolvedValue(mockResponse);
    
    // Execute the function
    const result = await analyzeShelfImage(mockImageUrl, mockImageId);
    
    // Verify the flow
    // 1. First executeWithRetry should be called to queue the job
    expect(retry.executeWithRetry).toHaveBeenCalledWith(
      mockImageUrl, 
      mockImageId,
      expect.any(Object)
    );
    
    // 2. Then waitForAnalysisCompletion should poll until completion
    expect(core.waitForAnalysisCompletion).toHaveBeenCalledWith(
      mockImageId,
      mockJobId,
      expect.any(Object)
    );
    
    // 3. Finally transformAnalysisResult should format the data
    expect(transformers.transformAnalysisResult).toHaveBeenCalledWith(mockResponse);
    
    // Verify the final result contains the expected data
    expect(result).toEqual(mockResponse.data.data);
  });
  
  it('should handle errors from executeWithRetry', async () => {
    // Setup mocks to simulate error
    const mockError = new Error('Test error');
    vi.mocked(retry.executeWithRetry).mockRejectedValue(mockError);
    
    // Execute and expect rejection
    await expect(analyzeShelfImage(mockImageUrl, mockImageId))
      .rejects.toThrow('Test error');
      
    // Verify waitForAnalysisCompletion was not called due to the error
    expect(core.waitForAnalysisCompletion).not.toHaveBeenCalled();
  });
  
  it('should pass options to executeWithRetry and waitForAnalysisCompletion', async () => {
    // Setup mocks
    vi.mocked(retry.executeWithRetry).mockResolvedValue({
      success: true,
      jobId: mockJobId,
      status: 'queued'
    });
    
    vi.mocked(core.waitForAnalysisCompletion).mockResolvedValue(mockResponse);
    
    const options = { retryCount: 5, timeout: 30000 };
    
    // Execute the function with options
    await analyzeShelfImage(mockImageUrl, mockImageId, options);
    
    // Verify options were passed to both functions
    expect(retry.executeWithRetry).toHaveBeenCalledWith(
      mockImageUrl,
      mockImageId,
      options
    );
    
    expect(core.waitForAnalysisCompletion).toHaveBeenCalledWith(
      mockImageId,
      mockJobId,
      options
    );
  });
});
