
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
    
    // 1. Mock Claude service
    const claudeStub = stub(claudeService, "analyzeImageWithClaude", () => {
      return Promise.resolve([{
        SKUBrand: "Test Brand",
        SKUFullName: "Test Product",
        NumberFacings: 3,
        PriceSKU: "$5.99",
        ShelfSection: "middle",
        BoundingBox: { confidence: 0.95 }
      }]);
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
    
    assertEquals(analyzeBody.success, true);
    assertEquals(analyzeBody.status, "queued");
    assertExists(analyzeBody.jobId);
    
    // Step 2: Process the job with process-next
    const processResponse = await handleProcessNext(processRequest, "test-request-id-2");
    const processBody = await processResponse.json();
    
    // Step 3: Verify the results
    assertEquals(processBody.success, true);
    assertEquals(processBody.message, "Job processed successfully");
    
    // Verify Claude was called
    assertEquals(claudeStub.calls.length, 1);
    
    // Verify job was updated properly
    assertEquals(jobStatus, "completed");
    assertExists(jobResults);
    assertExists(jobResults.data);
    assertEquals(Array.isArray(jobResults.data), true);
    assertEquals(jobResults.data.length, 1);
    assertEquals(jobResults.data[0].brand, "Test Brand");
    
  } finally {
    // Clean up all stubs
    restore();
  }
});
