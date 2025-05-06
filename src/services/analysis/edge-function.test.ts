
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { invokeAnalysisFunction } from './core';
import { transformAnalysisResult, ensureAnalysisDataType } from './transformers';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn()
    }
  }
}));

describe('Edge Function Integration', () => {
  // Test data for the new structured Claude format
  const mockClaudeStructuredResponse = {
    metadata: {
      total_items: 45,
      out_of_stock_positions: 8,
      empty_space_percentage: 15,
      image_quality: "good"
    },
    shelves: [
      {
        position: "top",
        items: [
          {
            position: "top-left",
            product_name: "Brand X Cereal",
            brand: "Brand X",
            price: "$4.99",
            facings: 3,
            stock_level: "medium",
            out_of_stock: false
          },
          {
            position: "top-center",
            out_of_stock: true,
            missing_product: "Unknown",
            empty_space_width: "medium"
          }
        ]
      },
      {
        position: "bottom",
        items: [
          {
            position: "bottom-right",
            product_name: "Brand Y Soda",
            brand: "Brand Y",
            price: "$2.49",
            facings: 5,
            stock_level: "high",
            out_of_stock: false
          }
        ]
      }
    ]
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('correctly calls the edge function and handles the new structured response', async () => {
    // Setup the mock response with Claude's new structured format
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({
        data: {
          success: true,
          status: 'completed',
          jobId: 'test-job-id',
          imageId: 'test-image-id',
          data: mockClaudeStructuredResponse
        },
        error: null
      });
    
    // Call the function being tested
    const result = await invokeAnalysisFunction('https://example.com/image.jpg', 'test-image-id');
    
    // Verify the calls to the Supabase functions
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('analyze-shelf-image', {
      body: { 
        imageUrl: 'https://example.com/image.jpg', 
        imageId: 'test-image-id',
        includeConfidence: true,
        directAnalysis: true
      }
    });
    
    // Verify the result contains the structured data format
    expect(result.success).toBeTruthy();
    expect(result.status).toBe('completed');
    expect(result.data).toEqual(mockClaudeStructuredResponse);
    
    // Now, test the transformation of the result
    const transformedResult = transformAnalysisResult(result);
    
    // Check the transformed data maintains the structured format
    expect(transformedResult).toEqual(mockClaudeStructuredResponse);
    expect(transformedResult.metadata.total_items).toBe(45);
    expect(transformedResult.shelves).toHaveLength(2);
    expect(transformedResult.shelves[0].items).toHaveLength(2);
  });
  
  it('handles edge function errors correctly', async () => {
    // Mock a failed response
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({
        data: null,
        error: new Error('Analysis failed: Test error')
      });
    
    // Call the function and expect it to reject
    await expect(invokeAnalysisFunction('https://example.com/image.jpg', 'test-image-id'))
      .rejects.toThrow();
    
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
  });
  
  it('handles empty or malformed data', () => {
    // Test with null data
    expect(transformAnalysisResult(null)).toBeNull();
    
    // Test with invalid data structure
    expect(transformAnalysisResult({ invalidKey: "value" })).toBeNull();
    
    // Test that ensureAnalysisDataType preserves the original structure
    const testData = { 
      metadata: { total_items: 10 }, 
      shelves: [{ position: "top", items: [] }] 
    };
    
    const result = ensureAnalysisDataType(testData);
    expect(result).toEqual(testData);
  });
});
