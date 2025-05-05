
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { analyzeShelfImage } from './index';
import * as retry from './retry';
import * as transformers from './transformers';

// Mock dependencies
vi.mock('./retry', () => ({
  executeWithRetry: vi.fn()
}));

vi.mock('./transformers', () => ({
  transformAnalysisResult: vi.fn(data => data)
}));

describe('Image Analysis Service', () => {
  const mockImageUrl = 'https://example.com/test-image.jpg';
  const mockImageId = 'test-image-id-123';
  const mockResponse = {
    success: true,
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
  
  it('should analyze an image successfully', async () => {
    // Setup mocks
    vi.mocked(retry.executeWithRetry).mockResolvedValue(mockResponse);
    
    // Execute the function
    const result = await analyzeShelfImage(mockImageUrl, mockImageId);
    
    // Verify the result
    expect(result).toEqual(mockResponse.data);
    
    // Verify retry was called with correct parameters
    expect(retry.executeWithRetry).toHaveBeenCalledWith(
      mockImageUrl, 
      mockImageId,
      expect.any(Object)
    );
    
    // Verify transformer was called
    expect(transformers.transformAnalysisResult).toHaveBeenCalledWith(mockResponse);
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
    // Setup mocks
    vi.mocked(retry.executeWithRetry).mockResolvedValue(mockResponse);
    
    const options = { retryCount: 5, timeout: 30000 };
    
    // Execute the function with options
    await analyzeShelfImage(mockImageUrl, mockImageId, options);
    
    // Verify options were passed
    expect(retry.executeWithRetry).toHaveBeenCalledWith(
      mockImageUrl,
      mockImageId,
      options
    );
  });
});
