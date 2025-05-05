
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import { handleAnalyzeRequest } from "../../analyze-handler.ts";
import { handleProcessNext } from "../../queue-processor.ts";
import { handleStatusCheck } from "../../status-handler.ts";
import * as claudeService from "../../claude-service.ts";
import * as queue from "../../queue.ts";
import { corsHeaders } from "../../cors.ts";

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
const mockEnv = {
  get: (key: string) => {
    if (key === "ANTHROPIC_API_KEY") return "test-api-key";
    if (key === "REQUIRE_AUTH") return "false";
    return originalEnv.get(key);
  },
  set: originalEnv.set,
  delete: originalEnv.delete,
  toObject: originalEnv.toObject
};

Deno.test("Integration: Process Next Endpoint Flow", async () => {
  try {
    // Replace Deno.env with mock
    Object.defineProperty(Deno, "env", { value: mockEnv });
    
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
    
    // Stub queue methods to simulate DB operations
    const queueStub = stub(queue, "getNextAnalysisJob", () => {
      return Promise.resolve({
        jobId: "test-job-id-processing",
        imageId: "test-image-id-processing",
        imageUrl: "https://example.com/test-image.jpg",
        attempts: 1
      });
    });
    
    const updateJobStub = stub(queue, "updateJobStatus", () => {
      return Promise.resolve();
    });
    
    // Stub Claude API call
    const claudeStub = stub(claudeService, "analyzeImageWithClaude", () => {
      return Promise.resolve(mockClaudeResponse);
    });
    
    // 2. Call the process-next endpoint directly
    const processRequest = createMockRequest("POST", {});
    const processResponse = await handleProcessNext(processRequest, "test-request-id-process");
    const processBody = await processResponse.json();
    
    // 3. Verify process response
    assertEquals(processBody.success, true);
    assertEquals(processBody.message, "Job processed successfully");
    assertEquals(processBody.jobId, "test-job-id-processing");
    
    // 4. Check that Claude API was called
    assertEquals(claudeStub.calls.length, 1);
    
    // 5. Check that job status was updated
    assertEquals(updateJobStub.calls.length, 1);
    assertEquals(updateJobStub.calls[0].args[0], "test-job-id-processing");
    assertEquals(updateJobStub.calls[0].args[1], "completed");
    
  } finally {
    // Clean up stubs
    restore();
    
    // Restore original Deno.env
    Object.defineProperty(Deno, "env", { value: originalEnv });
  }
});

Deno.test("Integration: Direct Process Next URL Access", async () => {
  try {
    // Replace Deno.env with mock
    Object.defineProperty(Deno, "env", { value: mockEnv });
    
    // Create a mock URL that simulates accessing /process-next directly
    const url = new URL("https://example.com/process-next");
    
    // Create a mock Request object that simulates accessing /process-next directly
    const request = new Request(url, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"
      }),
    });
    
    // Stub all necessary dependencies
    const queueStub = stub(queue, "getNextAnalysisJob", () => {
      return Promise.resolve({
        jobId: "test-job-id-direct",
        imageId: "test-image-id-direct",
        imageUrl: "https://example.com/test-image-direct.jpg",
        attempts: 1
      });
    });
    
    const updateJobStub = stub(queue, "updateJobStatus", () => {
      return Promise.resolve();
    });
    
    const claudeStub = stub(claudeService, "analyzeImageWithClaude", () => {
      return Promise.resolve([
        {
          brand: "Direct Brand",
          product: "Direct Product",
          visibility: 5,
          position: "top"
        }
      ]);
    });
    
    // Call the process-next handler directly
    const response = await handleProcessNext(request, "test-direct-request-id");
    
    // Verify response
    assertEquals(response.status, 200);
    
    const responseBody = await response.json();
    assertEquals(responseBody.success, true);
    assertEquals(responseBody.jobId, "test-job-id-direct");
    
    // Verify Claude was called
    assertEquals(claudeStub.calls.length, 1);
    
  } finally {
    restore();
    Object.defineProperty(Deno, "env", { value: originalEnv });
  }
});

// Run the tests
Deno.test("Run the process-next tests", async () => {
  const command = new Deno.Command(Deno.execPath(), {
    args: [
      "test",
      "--allow-env",
      "--allow-net",
      "--allow-read",
      "tests/integration/process-next-flow.test.ts"
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();
  
  const textDecoder = new TextDecoder();
  const output = textDecoder.decode(stdout);
  const error = textDecoder.decode(stderr);
  
  console.log("Test Output:", output);
  
  if (error) {
    console.error("Test Errors:", error);
  }
  
  assertEquals(code, 0, "Tests should pass with exit code 0");
});
