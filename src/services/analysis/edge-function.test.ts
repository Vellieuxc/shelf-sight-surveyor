
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
  const mockClaudeFormatResponse = {
    data: [
      { 
        SKUBrand: "Test Brand", 
        SKUFullName: "Test Product", 
        NumberFacings: 3,
        PriceSKU: "$5.99",
        ShelfSection: "top",
        BoundingBox: { confidence: 0.95 }
      },
      {
        SKUBrand: "Another Brand",
        SKUFullName: "Another Product",
        NumberFacings: 2,
        PriceSKU: "$3.99",
        ShelfSection: "middle",
        BoundingBox: { confidence: 0.82 }
      }
    ]
  };
  
  beforeEach(() => {
    vi.resetAllMocks();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('correctly calls the edge function and transforms the response', async () => {
    // Setup the mock response with Claude's format
    vi.mocked(supabase.functions.invoke)
      .mockResolvedValueOnce({
        data: {
          success: true,
          status: 'completed',
          jobId: 'test-job-id',
          imageId: 'test-image-id',
          data: mockClaudeFormatResponse.data
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
    
    // Verify the result
    expect(result.success).toBeTruthy();
    expect(result.status).toBe('completed');
    
    // Now, test the transformation of the result
    const transformedResult = transformAnalysisResult(result);
    
    // Check the transformed data
    expect(transformedResult).toHaveLength(2);
    expect(transformedResult[0].brand).toBe('Test Brand');
    expect(transformedResult[0].sku_name).toBe('Test Product');
    expect(transformedResult[0].sku_count).toBe(3);
    expect(transformedResult[0].sku_price).toBe(5.99);
    expect(transformedResult[0].sku_position).toBe('top');
    expect(transformedResult[0].sku_confidence).toBe('high');
    
    // Check second item
    expect(transformedResult[1].brand).toBe('Another Brand');
    expect(transformedResult[1].sku_count).toBe(2);
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
    expect(transformAnalysisResult(null)).toEqual([]);
    
    // Test with invalid data structure
    expect(transformAnalysisResult({ invalidKey: "value" })).toEqual([]);
    
    // Test with empty data array
    expect(transformAnalysisResult({ data: [] })).toEqual([]);
  });

  it('correctly transforms data from Claude format to frontend format', () => {
    const sampleInput = [
      {
        SKUBrand: "Test Brand",
        SKUFullName: "Test Product",
        NumberFacings: 3,
        PriceSKU: "$5.99",
        ShelfSection: "middle",
        BoundingBox: { confidence: 0.95 }
      },
      {
        brand: "Direct Brand",
        sku_name: "Direct Product",
        sku_count: 4,
        sku_price: 7.99,
        sku_position: "bottom",
        sku_confidence: "medium"
      }
    ];

    const result = ensureAnalysisDataType(sampleInput);
    
    expect(result).toHaveLength(2);
    // First item: Claude format transformed
    expect(result[0].brand).toBe("Test Brand");
    expect(result[0].sku_name).toBe("Test Product");
    expect(result[0].sku_count).toBe(3);
    expect(result[0].sku_price).toBe(5.99);
    expect(result[0].sku_position).toBe("middle");
    expect(result[0].sku_confidence).toBe("high");
    
    // Second item: Already in our format
    expect(result[1].brand).toBe("Direct Brand");
    expect(result[1].sku_count).toBe(4);
    expect(result[1].sku_price).toBe(7.99);
  });
});
