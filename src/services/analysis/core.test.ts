
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processNextQueuedAnalysis, invokeAnalysisFunction, waitForAnalysisCompletion } from './core';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Analysis Core Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  describe('processNextQueuedAnalysis', () => {
    it('should invoke the process-next edge function', async () => {
      // Set up the mock to return a successful response
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { success: true, message: 'Job processed successfully' },
        error: null
      });
      
      await processNextQueuedAnalysis();
      
      // Verify the edge function was called with the correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-shelf-image/process-next', {
        body: {}
      });
    });
    
    it('should throw an error when the edge function fails', async () => {
      // Set up the mock to return an error
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: new Error('Failed to process next job')
      });
      
      await expect(processNextQueuedAnalysis()).rejects.toThrow();
    });
  });
  
  describe('invokeAnalysisFunction', () => {
    it('should throw an error if image URL is missing', async () => {
      await expect(invokeAnalysisFunction('', 'test-id')).rejects.toThrow('Image URL is required');
    });
    
    it('should throw an error if image ID is missing', async () => {
      await expect(invokeAnalysisFunction('https://example.com/image.jpg', '')).rejects.toThrow('Valid image ID is required');
    });
    
    it('should throw an error if image URL is invalid', async () => {
      await expect(invokeAnalysisFunction('not-a-url', 'test-id')).rejects.toThrow('Invalid image URL format');
    });
    
    it('should successfully queue an analysis job', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { 
          success: true, 
          status: 'queued', 
          jobId: 'test-job-id',
          imageId: 'test-image-id'
        },
        error: null
      });
      
      // Mock process-next call
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: null
      });
      
      // Mock the status check to immediately return completed status
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { 
          success: true, 
          status: 'completed',
          jobId: 'test-job-id',
          imageId: 'test-image-id',
          data: [{ brand: 'Test', sku_name: 'Product' }]
        },
        error: null
      });
      
      const result = await invokeAnalysisFunction(
        'https://example.com/image.jpg', 
        'test-image-id'
      );
      
      expect(result).toEqual({ 
        success: true, 
        status: 'completed',
        jobId: 'test-job-id',
        imageId: 'test-image-id',
        data: [{ brand: 'Test', sku_name: 'Product' }]
      });
      
      // Verify the edge function was called with the correct parameters
      expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-shelf-image', {
        body: {
          imageUrl: 'https://example.com/image.jpg',
          imageId: 'test-image-id',
          includeConfidence: true
        }
      });
      
      // Verify that processNextQueuedAnalysis was called
      expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-shelf-image/process-next', {
        body: {}
      });
    });
  });
});
