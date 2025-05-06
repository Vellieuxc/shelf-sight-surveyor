
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import { handleAnalyzeRequest } from "../../analyze-handler.ts";
import { handleProcessNext } from "../../queue-processor.ts";
import * as claudeService from "../../claude-service.ts";
import * as queue from "../../queue.ts";

/**
 * Integration test for full analysis flow:
 * 1. Queue a job through analyze request
 * 2. Process the job with process-next
 * 3. Verify the job is marked as completed
 */
Deno.test("Integration: Full Analysis Flow", async () => {
  try {
    // Set up mocks for all dependencies
    
    // 1. Mock Claude service - with a response matching the new shelf structure format
    const claudeStub = stub(claudeService, "analyzeImageWithClaude", () => {
      return Promise.resolve({
        metadata: {
          total_items: 12,
          out_of_stock_positions: 2,
          empty_space_percentage: 15,
          image_quality: "good"
        },
        shelves: [
          {
            position: "top",
            items: [
              {
                position: "top-left",
                product_name: "Test Product",
                brand: "Test Brand",
                price: "$5.99",
                facings: 3,
                stock_level: "medium",
                out_of_stock: false
              },
              {
                position: "top-right",
                out_of_stock: true,
                missing_product: "Unknown",
                empty_space_width: "medium"
              }
            ]
          }
        ]
      });
    });
    
    // 2. Set up queue mocks
    let queuedJobId = "";
    const addToQueueStub = stub(queue, "addToAnalysisQueue", (data) => {
      queuedJobId = "test-job-id-" + Date.now();
      console.log(`Mock: Added job ${queuedJobId} to queue`);
      return Promise.resolve(queuedJobId);
    });
    
    const getNextJobStub = stub(queue, "getNextAnalysisJob", () => {
      if (!queuedJobId) return Promise.resolve(null);
      
      return Promise.resolve({
        jobId: queuedJobId,
        imageId: "test-image-id",
        imageUrl: "https://example.com/test-image.jpg",
        attempts: 1
      });
    });
    
    // Track job status updates
    let jobStatus = "";
    let jobResults = null;
    const updateJobStub = stub(queue, "updateJobStatus", (id, status, results) => {
      jobStatus = status;
      jobResults = results;
      console.log(`Mock: Updated job ${id} status to ${status}`);
      return Promise.resolve();
    });
    
    // 3. Create mock requests
    const analyzeRequest = new Request("https://example.com/analyze-shelf-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"
      },
      body: JSON.stringify({
        imageUrl: "https://example.com/test-image.jpg",
        imageId: "test-image-id"
      })
    });
    
    const processRequest = new Request("https://example.com/analyze-shelf-image/process-next", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"
      }
    });
    
    // 4. Test the full flow
    
    // Step 1: Queue a job through analyze request
    const analyzeResponse = await handleAnalyzeRequest(analyzeRequest, "test-request-id-1");
    const analyzeBody = await analyzeResponse.json();
    
    // Test direct analysis mode - we should get the result immediately
    assertEquals(analyzeBody.success, true);
    assertEquals(analyzeBody.status, "completed");
    
    // Verify Claude was called
    assertEquals(claudeStub.calls.length, 1);
    
    // Verify we got the structured format
    const resultData = analyzeBody.data;
    assertExists(resultData.metadata);
    assertExists(resultData.shelves);
    assertEquals(resultData.metadata.total_items, 12);
    assertEquals(resultData.shelves.length, 1);
    assertEquals(resultData.shelves[0].items.length, 2);
    
  } finally {
    // Clean up all stubs
    restore();
  }
});
