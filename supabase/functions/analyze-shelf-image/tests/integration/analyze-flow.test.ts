
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import { handleAnalyzeRequest } from "../../analyze-handler.ts";
import * as claudeService from "../../claude-service.ts";

// Mock Request creation helper
function createMockRequest(method: string, body?: any): Request {
  return {
    method,
    headers: new Headers({
      "Content-Type": "application/json",
      "Authorization": "Bearer test-token"
    }),
    json: () => Promise.resolve(body)
  } as unknown as Request;
}

Deno.test("Integration: Direct analysis workflow", async () => {
  try {
    // 1. Mock Claude API response
    const mockClaudeResponse = {
      metadata: {
        total_items: 25,
        out_of_stock_positions: 3
      },
      shelves: [
        {
          position: "top",
          items: [
            {
              position: "top-left",
              product_name: "Test Cola",
              brand: "Test Brand"
            }
          ]
        }
      ]
    };
    
    // Stub Claude API call
    stub(claudeService, "analyzeImageWithClaude", () => {
      return Promise.resolve(mockClaudeResponse);
    });
    
    // 2. Create a test request
    const analyzeRequest = createMockRequest("POST", {
      imageUrl: "https://example.com/test-image.jpg",
      imageId: "test-integration-image-1"
    });
    
    // 3. Call the analyze endpoint
    const analyzeResponse = await handleAnalyzeRequest(analyzeRequest, "test-request-id-1");
    const analyzeBody = await analyzeResponse.json();
    
    // 4. Verify response structure
    assertEquals(analyzeResponse.status, 200);
    assertEquals(analyzeBody.success, true);
    assertEquals(analyzeBody.status, "completed");
    assertEquals(analyzeBody.imageId, "test-integration-image-1");
    assertExists(analyzeBody.data);
    assertEquals(analyzeBody.data.metadata.total_items, 25);
    
  } finally {
    // Clean up stubs
    restore();
  }
});

Deno.test("Integration: Error handling for missing parameters", async () => {
  // Test with missing imageUrl
  const invalidRequest = createMockRequest("POST", {
    imageId: "test-image-error-1"
  });
  
  const response = await handleAnalyzeRequest(invalidRequest, "test-request-id-error-1");
  const body = await response.json();
  
  assertEquals(response.status, 400);
  assertEquals(body.success, false);
  assertEquals(body.error.includes("Missing required parameters"), true);
});
