import { describe, it, expect, vi } from 'vitest';
import { transformAnalysisResult, ensureAnalysisDataType } from './transformers';

describe('Analysis Data Transformers', () => {
  it('should transform analysis result correctly', () => {
    const mockResponse = {
      data: {
        metadata: {
          analysis_status: 'completed',
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
    expect(result).toEqual({
      metadata: {
        analysis_status: 'completed',
        total_items: 45,
        out_of_stock_positions: 8
      },
      shelves: mockResponse.data.shelves
    });
  });

  it('should handle null or undefined input', () => {
    expect(transformAnalysisResult(null)).toBeNull();
    expect(transformAnalysisResult(undefined)).toBeNull();
    expect(transformAnalysisResult({} as any)).toBeNull();
    expect(transformAnalysisResult({ data: {} } as any)).toBeNull();
  });

  it('should handle missing metadata fields', () => {
    const mockResponse = {
      data: {
        metadata: {},
        shelves: []
      }
    };

    const result = transformAnalysisResult(mockResponse);
    expect(result).toEqual({
      metadata: {
        analysis_status: 'empty',
        total_items: 0,
        out_of_stock_positions: 0
      },
      shelves: []
    });
  });

  it('should ensure analysis data type maintains structure', () => {
    const testData = {
      metadata: {
        analysis_status: 'completed',
        total_items: 10,
        out_of_stock_positions: 2
      },
      shelves: [{ position: "middle", items: [] }]
    };

    const result = ensureAnalysisDataType(testData);
    expect(result).toEqual(testData);
  });
});
