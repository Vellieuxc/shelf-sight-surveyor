
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeShelfImage } from './index';
import * as retryModule from './retry';
import { AnalysisStatus } from './types';

// Mock the retry module
vi.mock('./retry', () => ({
  executeWithRetry: vi.fn()
}));

describe('analyzeShelfImage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('should call executeWithRetry with the right parameters', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-image-id';
    const options = { includeConfidence: true };
    
    const mockResponse = {
      success: true,
      jobId: 'test-job',
      status: 'completed' as AnalysisStatus,
      data: [
        { brand: 'Test Brand', sku_name: 'Test Product', sku_count: 2 }
      ]
    };
    
    // Mock the executeWithRetry function to return a successful response
    vi.mocked(retryModule.executeWithRetry).mockResolvedValue(mockResponse);
    
    // Execute the function
    const result = await analyzeShelfImage(imageUrl, imageId, options);
    
    // Assertions
    expect(retryModule.executeWithRetry).toHaveBeenCalledWith(imageUrl, imageId, options);
    expect(result).toEqual(mockResponse.data);
  });
  
  it('should handle errors from executeWithRetry', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-error-image';
    
    const error = new Error('Test error');
    
    // Mock the executeWithRetry function to throw an error
    vi.mocked(retryModule.executeWithRetry).mockRejectedValue(error);
    
    // Execute the function and catch the error
    await expect(analyzeShelfImage(imageUrl, imageId)).rejects.toThrow('Test error');
  });
  
  it('should handle null response data', async () => {
    // Setup
    const imageUrl = 'https://example.com/image.jpg';
    const imageId = 'test-null-data';
    
    const mockResponse = {
      success: true,
      jobId: 'test-job',
      status: 'completed' as AnalysisStatus,
      data: null
    };
    
    // Mock the executeWithRetry function to return a response with null data
    vi.mocked(retryModule.executeWithRetry).mockResolvedValue(mockResponse);
    
    // Execute the function
    const result = await analyzeShelfImage(imageUrl, imageId);
    
    // Assertions
    expect(result).toBeNull();
  });
});
