
import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import * as claudeService from "../claude-service.ts";

// Mock global fetch to avoid making real API calls
const originalFetch = globalThis.fetch;

// Mock global Deno.env
const originalEnv = Deno.env;

Deno.test("fetchAndConvertImageToBase64: handles large images without stack overflow", async () => {
  try {
    // Set up a mock response with a sample image
    const mockImageData = new Uint8Array(1024 * 1024); // 1MB of data
    for (let i = 0; i < mockImageData.length; i++) {
      mockImageData[i] = i % 256;
    }
    
    // Replace global fetch with our mock
    globalThis.fetch = stub("fetch", () => {
      return Promise.resolve({
        ok: true,
        blob: () => new Blob([mockImageData.buffer]),
      });
    });
    
    // Access and invoke the private fetchAndConvertImageToBase64 function using Deno's Reflect API
    // @ts-ignore - accessing private function for testing
    const base64Result = await claudeService.fetchAndConvertImageToBase64("https://example.com/test.jpg", "test-request-id");
    
    // Verify we got a base64 string back
    assertEquals(typeof base64Result, "string");
    assertExists(base64Result);
    
    // Verify the base64 string is non-empty and valid
    assertEquals(base64Result.length > 0, true);
    
    // Try to decode the base64 string - this will throw if invalid
    const decoded = atob(base64Result);
    assertEquals(decoded.length, mockImageData.length);
    
  } finally {
    // Restore original fetch
    globalThis.fetch = originalFetch;
  }
});

Deno.test("analyzeImageWithClaude: properly integrates with Claude API", async () => {
  try {
    // Mock Deno.env
    Object.defineProperty(Deno, "env", { 
      value: {
        get: (key: string) => {
          if (key === "ANTHROPIC_API_KEY") return "mock-api-key";
          return originalEnv.get(key);
        }
      }
    });
    
    // Set up mock responses for both fetch calls (image and Claude API)
    let fetchCallCount = 0;
    globalThis.fetch = stub("fetch", () => {
      fetchCallCount++;
      
      if (fetchCallCount === 1) {
        // First call is for the image
        return Promise.resolve({
          ok: true,
          blob: () => new Blob([new Uint8Array(100).buffer]),
        });
      } else {
        // Second call is to Claude API
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            content: [{ 
              text: '[{"SKUBrand": "Test Brand", "SKUFullName": "Test Product", "NumberFacings": 3}]' 
            }]
          }),
        });
      }
    });
    
    // Call the function
    const result = await claudeService.analyzeImageWithClaude("https://example.com/test.jpg", "test-request-id");
    
    // Verify the result
    assertEquals(Array.isArray(result), true);
    assertEquals(result.length, 1);
    assertEquals(result[0].SKUBrand, "Test Brand");
    assertEquals(result[0].SKUFullName, "Test Product");
    assertEquals(result[0].NumberFacings, 3);
    
  } finally {
    // Restore originals
    globalThis.fetch = originalFetch;
    Object.defineProperty(Deno, "env", { value: originalEnv });
  }
});

Deno.test("analyzeImageWithClaude: handles fetch errors gracefully", async () => {
  try {
    // Mock a failing fetch
    globalThis.fetch = stub("fetch", () => {
      return Promise.resolve({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });
    });
    
    // Set mock API key
    Object.defineProperty(Deno, "env", { 
      value: {
        get: (key: string) => {
          if (key === "ANTHROPIC_API_KEY") return "mock-api-key";
          return originalEnv.get(key);
        }
      }
    });
    
    // Expect the function to reject with an error
    await assertRejects(
      () => claudeService.analyzeImageWithClaude("https://example.com/test.jpg", "test-error-id"),
      Error,
      "Failed to fetch image"
    );
    
  } finally {
    // Restore originals
    globalThis.fetch = originalFetch;
    Object.defineProperty(Deno, "env", { value: originalEnv });
  }
});

Deno.test("analyzeImageWithClaude: handles API key absence", async () => {
  try {
    // Mock missing API key
    Object.defineProperty(Deno, "env", { 
      value: {
        get: (key: string) => {
          // Return undefined for API key
          if (key === "ANTHROPIC_API_KEY") return undefined;
          return originalEnv.get(key);
        }
      }
    });
    
    // Expect the function to reject with a specific error
    await assertRejects(
      () => claudeService.analyzeImageWithClaude("https://example.com/test.jpg", "test-no-key-id"),
      Error,
      "Missing ANTHROPIC_API_KEY"
    );
    
  } finally {
    // Restore original env
    Object.defineProperty(Deno, "env", { value: originalEnv });
  }
});
