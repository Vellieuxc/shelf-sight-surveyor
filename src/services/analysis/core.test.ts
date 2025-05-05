
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invokeAnalysisFunction } from './core';
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
    
    it('should successfully analyze an image', async () => {
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
          includeConfidence: true,
          directAnalysis: true
        }
      });
    });
  });
});
