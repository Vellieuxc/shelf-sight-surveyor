
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { handleAnalyzeRequest } from "../../analyze-handler.ts";
import { handleProcessNext } from "../../queue-processor.ts";
import { handleStatusCheck } from "../../status-handler.ts";
import { mockClaudeService, defaultMockResponse } from "../mocks/claude-service.mock.ts";
import { setupTestEnv, createMockRequest, clearMockKvStore } from "../setup.ts";

Deno.test("Integration: Full analysis workflow with mocks", async () => {
  // Set up test environment
  const cleanupEnv = setupTestEnv();
  
  // Set up Claude service mock
  const claudeMock = mockClaudeService();
  
  try {
    // Clear any existing data
    clearMockKvStore();
    
    // Configure mock with custom response
    const customMockResponse = [...defaultMockResponse];
    customMockResponse[0].SKUFullName = "Custom Test Product";
    claudeMock.setMockResponse(customMockResponse);
    
    // 1. Call the analyze endpoint
    const analyzeRequest = createMockRequest("POST", {
      imageUrl: "https://example.com/custom-test-image.jpg",
      imageId: "test-custom-image-1"
    });
    
    const analyzeResponse = await handleAnalyzeRequest(analyzeRequest, "test-custom-request-1");
    const analyzeBody = await analyzeResponse.json();
    
    // 2. Verify analyze response
    assertEquals(analyzeBody.success, true);
    assertEquals(analyzeBody.status, "queued");
    assertExists(analyzeBody.jobId);
    
    const jobId = analyzeBody.jobId;
    
    // 3. Process the job
    const processRequest = createMockRequest("POST", {});
    const processResponse = await handleProcessNext(processRequest, "test-custom-request-2");
    
    // 4. Check the status
    const statusRequest = createMockRequest("POST", {
      imageId: "test-custom-image-1"
    });
    
    const statusResponse = await handleStatusCheck(statusRequest, "test-custom-request-3");
    const statusBody = await statusResponse.json();
    
    // 5. Verify the transformed data from our custom mock
    assertEquals(statusBody.success, true);
    assertEquals(statusBody.status, "completed");
    const data = statusBody.data.data;
    
    assertEquals(data.length, 3); // Our mock has 3 items
    assertEquals(data[0].sku_name, "Custom Test Product"); // Custom name we set
    assertEquals(data[2].empty_space_estimate, 100); // The out of stock item
    
  } finally {
    // Clean up
    claudeMock.restore();
    cleanupEnv();
  }
});

Deno.test("Integration: Error handling with mocks", async () => {
  // Set up test environment
  const cleanupEnv = setupTestEnv();
  
  // Set up Claude service mock
  const claudeMock = mockClaudeService();
  
  try {
    // Clear any existing data
    clearMockKvStore();
    
    // Configure mock to fail
    claudeMock.setShouldFail(true);
    
    // 1. Queue a job successfully
    const analyzeRequest = createMockRequest("POST", {
      imageUrl: "https://example.com/error-test-image.jpg",
      imageId: "test-error-image-1"
    });
    
    const analyzeResponse = await handleAnalyzeRequest(analyzeRequest, "test-error-request-1");
    const analyzeBody = await analyzeResponse.json();
    assertEquals(analyzeBody.success, true);
    
    // 2. Process the job, which should fail due to our mock configuration
    const processRequest = createMockRequest("POST", {});
    const processResponse = await handleProcessNext(processRequest, "test-error-request-2");
    const processBody = await processResponse.json();
    
    // 3. Verify error response
    assertEquals(processResponse.status, 500);
    assertEquals(processBody.success, false);
    assertEquals(processBody.error, "Mock Claude API error");
    
    // 4. Check the status to confirm job was marked as failed
    const statusRequest = createMockRequest("POST", {
      imageId: "test-error-image-1"
    });
    
    const statusResponse = await handleStatusCheck(statusRequest, "test-error-request-3");
    const statusBody = await statusResponse.json();
    
    assertEquals(statusBody.status, "failed");
    
  } finally {
    // Clean up
    claudeMock.restore();
    cleanupEnv();
  }
});
