
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import { handleAnalyzeRequest } from "../../analyze-handler.ts";
import { handleProcessNext } from "../../queue-processor.ts";
import { handleStatusCheck } from "../../status-handler.ts";
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

// Mock global Deno.env for tests
const originalEnv = Deno.env;
Deno.env = {
  get: (key: string) => {
    if (key === "ANTHROPIC_API_KEY") return "test-api-key";
    if (key === "REQUIRE_AUTH") return "false";
    return originalEnv.get(key);
  },
  set: originalEnv.set,
  delete: originalEnv.delete,
  toObject: originalEnv.toObject
};

Deno.test("Integration: Full analysis workflow", async () => {
  try {
    // 1. Mock Claude API
    const mockClaudeResponse = [
      {
        SKUFullName: "Test Cola",
        SKUBrand: "Test Brand",
        NumberFacings: 3,
        PriceSKU: "$2.99",
        ShelfSection: "middle",
        BoundingBox: { confidence: 0.95 }
      }
    ];
    
    // Stub Claude API call
    stub(claudeService, "analyzeImageWithClaude", () => {
      return Promise.resolve(mockClaudeResponse);
    });
    
    // 2. Call the analyze endpoint
    const analyzeRequest = createMockRequest("POST", {
      imageUrl: "https://example.com/test-image.jpg",
      imageId: "test-integration-image-1"
    });
    
    const analyzeResponse = await handleAnalyzeRequest(analyzeRequest, "test-request-id-1");
    const analyzeBody = await analyzeResponse.json();
    
    // 3. Verify analyze response
    assertEquals(analyzeBody.success, true);
    assertEquals(analyzeBody.status, "queued");
    assertExists(analyzeBody.jobId);
    assertEquals(analyzeBody.imageId, "test-integration-image-1");
    
    const jobId = analyzeBody.jobId;
    
    // 4. Call the process-next endpoint to process the queued job
    const processRequest = createMockRequest("POST", {});
    const processResponse = await handleProcessNext(processRequest, "test-request-id-2");
    const processBody = await processResponse.json();
    
    // 5. Verify process response
    assertEquals(processBody.success, true);
    assertEquals(processBody.message, "Job processed successfully");
    assertEquals(processBody.jobId, jobId);
    
    // 6. Call the status endpoint to check job status
    const statusRequest = createMockRequest("POST", {
      imageId: "test-integration-image-1"
    });
    
    const statusResponse = await handleStatusCheck(statusRequest, "test-request-id-3");
    const statusBody = await statusResponse.json();
    
    // 7. Verify status response with complete data
    assertEquals(statusBody.success, true);
    assertEquals(statusBody.status, "completed");
    assertExists(statusBody.data);
    
    // 8. Verify transformed data
    const data = statusBody.data.data;
    assertEquals(data.length, 1);
    assertEquals(data[0].sku_name, "Test Cola");
    assertEquals(data[0].brand, "Test Brand");
    assertEquals(data[0].sku_count, 3);
    assertEquals(data[0].sku_price, 2.99);
    assertEquals(data[0].sku_confidence, "high");
    
  } finally {
    // Clean up stubs
    restore();
    
    // Restore original Deno.env
    Deno.env = originalEnv;
  }
});
