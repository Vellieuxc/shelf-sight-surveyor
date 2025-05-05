
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { waitForAnalysisCompletion } from './core';

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
  
  it('polls status until completion', async () => {
    // Setup the mock responses for the status check
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
      // Second call returns "completed" status with results
      .mockResolvedValueOnce({
        data: {
          success: true,
          status: 'completed',
          jobId: 'test-job-id',
          imageId: 'test-image-id',
          data: [
            { 
              brand: 'Test Brand', 
              sku_name: 'Test Product', 
              sku_count: 3 
            }
          ]
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
    expect(result).toEqual({
      success: true,
      status: 'completed',
      jobId: 'test-job-id',
      imageId: 'test-image-id',
      data: [
        { 
          brand: 'Test Brand', 
          sku_name: 'Test Product', 
          sku_count: 3 
        }
      ]
    });
  });
  
  it('handles edge function errors correctly', async () => {
    // Mock a failed response
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({
        data: {
          success: true,
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
});
