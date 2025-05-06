
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import { handleAnalyzeRequest } from "../../analyze-handler.ts";
import { handleProcessNext } from "../../queue-processor.ts";
import * as claudeService from "../../claude-service.ts";
import { ExternalServiceError } from "../../error-handler.ts";

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

Deno.test("Integration: Error handling for invalid inputs", async () => {
  // Missing imageUrl
  const invalidRequest = createMockRequest("POST", {
    imageId: "test-image-error-1"
  });
  
  const response = await handleAnalyzeRequest(invalidRequest, "test-request-id-error-1");
  const body = await response.json();
  
  assertEquals(response.status, 400);
  assertEquals(body.success, false);
  assertEquals(body.error.includes("Missing required parameters"), true);
});

Deno.test("Integration: Error handling for Claude API failures", async () => {
  try {
    // 1. Mock Claude API to throw an error
    stub(claudeService, "analyzeImageWithClaude", () => {
      throw new ExternalServiceError("Claude API unavailable");
    });
    
    // 2. Create a valid analysis request
    const analyzeRequest = createMockRequest("POST", {
      imageUrl: "https://example.com/error-test-image.jpg",
      imageId: "test-integration-error-2"
    });
    
    // 3. Call analyze endpoint directly
    const analyzeResponse = await handleAnalyzeRequest(analyzeRequest, "test-request-id-error-2");
    const analyzeBody = await analyzeResponse.json();
    
    // 4. Verify error handling
    assertEquals(analyzeResponse.status, 500);
    assertEquals(analyzeBody.success, false);
    assertEquals(analyzeBody.error, "Analysis error: Claude API unavailable");
    
  } finally {
    // Clean up stubs
    restore();
  }
});
