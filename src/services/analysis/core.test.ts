import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invokeAnalysisFunction } from './core';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    },
    from: vi.fn()
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
      const mockResponse = {
        data: {
          metadata: {
            analysis_status: 'completed',
            total_items: 45,
            out_of_stock_positions: 8
          },
          shelves: []
        },
        error: null
      };

      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce(mockResponse);
      
      const result = await invokeAnalysisFunction(
        'https://example.com/image.jpg', 
        'test-image-id'
      );
      
      expect(result).toEqual({
        success: true,
        jobId: expect.stringMatching(/^direct-\d+$/),
        status: 'completed',
        data: mockResponse.data
      });
      
      expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-shelf-image', {
        body: {
          imageUrl: 'https://example.com/image.jpg',
          imageId: 'test-image-id',
          includeConfidence: true,
          directAnalysis: true
        }
      });
    });

    it('should use existing data as fallback when edge function fails', async () => {
      const existingData = {
        metadata: {
          analysis_status: 'completed',
          total_items: 10,
          out_of_stock_positions: 2
        },
        shelves: []
      };

      // Mock the database query chain
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({
        data: { analysis_data: existingData },
        error: null
      });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle
      } as any);

      // Mock the edge function to fail
      vi.mocked(supabase.functions.invoke).mockRejectedValueOnce(new Error('Edge function failed'));

      const result = await invokeAnalysisFunction(
        'https://example.com/image.jpg',
        'test-image-id'
      );

      expect(result).toEqual({
        success: true,
        jobId: expect.stringMatching(/^fallback-\d+$/),
        status: 'completed',
        data: existingData
      });

      // Verify the database query chain was called correctly
      expect(mockSelect).toHaveBeenCalledWith('analysis_data');
      expect(mockEq).toHaveBeenCalledWith('id', 'test-image-id');
      expect(mockMaybeSingle).toHaveBeenCalled();
    });
  });
});
