
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { waitForAnalysisCompletion } from './core';
import { transformAnalysisResult } from './transformers';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Edge Function Integration', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  it('polls status until completion and correctly transforms data', async () => {
    // Setup the mock response with Claude's format
    vi.mocked(supabase.functions.invoke)
      // First call returns "processing" status
      .mockResolvedValueOnce({
        data: {
          success: true,
          status: 'processing',
          jobId: 'test-job-id',
          imageId: 'test-image-id'
        },
        error: null
      })
      // Second call returns "completed" status with results in Claude format
      .mockResolvedValueOnce({
        data: {
          success: true,
          status: 'completed',
          jobId: 'test-job-id',
          imageId: 'test-image-id',
          data: {
            data: [
              { 
                SKUBrand: "Test Brand", 
                SKUFullName: "Test Product", 
                NumberFacings: 3,
                PriceSKU: "$5.99",
                ShelfSection: "top"
              }
            ]
          }
        },
        error: null
      });
    
    // Mock the delay function to speed up tests
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      setTimeout(fn, 10); // Use a much shorter timeout for tests
      return 1 as any;
    });
    
    // Call the function being tested
    const result = await waitForAnalysisCompletion('test-image-id', 'test-job-id');
    
    // Verify the calls to the Supabase functions
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-shelf-image/status', {
      body: { imageId: 'test-image-id' }
    });
    
    // Verify the result
    expect(result.success).toBeTruthy();
    expect(result.status).toBe('completed');
    
    // Now, test the transformation of the result
    const transformedResult = transformAnalysisResult(result);
    
    // Check the transformed data
    expect(transformedResult).toHaveLength(1);
    expect(transformedResult[0].brand).toBe('Test Brand');
    expect(transformedResult[0].sku_name).toBe('Test Product');
    expect(transformedResult[0].sku_count).toBe(3);
    expect(transformedResult[0].sku_price).toBe(5.99);
    expect(transformedResult[0].sku_position).toBe('top');
  });
  
  it('handles edge function errors correctly', async () => {
    // Mock a failed response
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({
        data: {
          success: false,
          status: 'failed',
          message: 'Analysis failed: Test error',
          jobId: 'test-job-id',
          imageId: 'test-image-id'
        },
        error: null
      });
    
    // Mock delay as before
    vi.spyOn(global, 'setTimeout').mockImplementation((fn) => {
      setTimeout(fn, 10);
      return 1 as any;
    });
    
    // Call the function and expect it to reject
    await expect(waitForAnalysisCompletion('test-image-id', 'test-job-id'))
      .rejects.toThrow('Analysis failed: Test error');
    
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
  });
  
  it('handles empty or malformed data', () => {
    // Test with null data
    expect(transformAnalysisResult(null)).toEqual([]);
    
    // Test with invalid data structure
    expect(transformAnalysisResult({ invalidKey: "value" })).toEqual([]);
    
    // Test with empty data array
    expect(transformAnalysisResult({ data: { data: [] } })).toEqual([]);
  });
});
