
import { describe, it, expect, vi } from 'vitest';
import { transformAnalysisResult, ensureAnalysisDataType } from './transformers';

describe('Analysis Data Transformers', () => {
  it('should return raw data without transformation', () => {
    // Test with structured shelf format
    const mockResponse = {
      data: {
        metadata: {
          total_items: 45,
          out_of_stock_positions: 8
        },
        shelves: [
          {
            position: "top",
            items: [
              {
                position: "top-left",
                product_name: "Brand X Cereal",
                brand: "Brand X"
              }
            ]
          }
        ]
      }
    };

    const result = transformAnalysisResult(mockResponse);
    expect(result).toEqual(mockResponse.data);
    expect(result.metadata.total_items).toBe(45);
    expect(result.shelves).toHaveLength(1);
  });

  it('should handle null or undefined input', () => {
    expect(transformAnalysisResult(null)).toBeNull();
    expect(transformAnalysisResult(undefined)).toBeNull();
    expect(transformAnalysisResult({} as any)).toBeNull();
  });

  it('should ensure analysis data type maintains structure', () => {
    const testData = {
      metadata: { total_items: 10 },
      shelves: [{ position: "middle", items: [] }]
    };

    const result = ensureAnalysisDataType(testData);
    expect(result).toEqual(testData);
  });
});
