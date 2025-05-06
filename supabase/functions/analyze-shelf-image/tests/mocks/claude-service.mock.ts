
// Mock for Claude API service
import { ExternalServiceError } from "../../error-handler.ts";
import { analyzeImageWithClaude } from "../../claude-service.ts";

// Default mock response
const defaultMockResponse = [
  {
    SKUFullName: "Mock Cola",
    SKUBrand: "Mock Brand",
    NumberFacings: 2,
    PriceSKU: "$1.99",
    ShelfSection: "top",
    BoundingBox: { confidence: 0.9 },
    OutofStock: false
  },
  {
    SKUFullName: "Mock Water",
    SKUBrand: "Crystal Pure",
    NumberFacings: 4,
    PriceSKU: "$0.99",
    ShelfSection: "bottom",
    BoundingBox: { confidence: 0.85 },
    OutofStock: false
  },
  {
    SKUFullName: "Empty Shelf Space",
    SKUBrand: null,
    NumberFacings: 0,
    PriceSKU: null,
    ShelfSection: "middle",
    BoundingBox: { confidence: 0.75 },
    OutofStock: true
  }
];

// Configure mock behavior
let shouldFail = false;
let mockResponse = defaultMockResponse;
let responseDelay = 0;

export function mockClaudeService() {
  // Original function reference (for restoration)
  let originalFunction = analyzeImageWithClaude;
  
  try {
    // Import the real module and override function
    const claudeService = {
      analyzeImageWithClaude: async (imageUrl: string, requestId: string) => {
        console.log(`[MOCK] Claude API called with image: ${imageUrl} (requestId: ${requestId})`);
        
        if (responseDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, responseDelay));
        }
        
        if (shouldFail) {
          throw new ExternalServiceError("Mock Claude API error");
        }
        
        return [...mockResponse]; // Return a copy to prevent modification
      }
    };
    
    // Replace the original analyzeImageWithClaude function
    // @ts-ignore - Overriding for mocking purposes
    globalThis.analyzeImageWithClaude = claudeService.analyzeImageWithClaude;
    
    return {
      // Functions to configure mock behavior
      setMockResponse: (response: any[]) => {
        mockResponse = response;
      },
      setDefaultResponse: () => {
        mockResponse = defaultMockResponse;
      },
      setShouldFail: (fail: boolean) => {
        shouldFail = fail;
      },
      setResponseDelay: (delay: number) => {
        responseDelay = delay;
      },
      // Cleanup function to restore original
      restore: () => {
        // @ts-ignore - Restoring for mocking purposes
        globalThis.analyzeImageWithClaude = originalFunction;
      }
    };
  } catch (error) {
    console.error("Error setting up Claude service mock:", error);
    return {
      setMockResponse: () => {},
      setDefaultResponse: () => {},
      setShouldFail: () => {},
      setResponseDelay: () => {},
      restore: () => {}
    };
  }
}

// Export default mock response for reuse
export { defaultMockResponse };
