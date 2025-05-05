
import { assertEquals, assertRejects, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";
import { analyzeImageWithClaude } from "../../claude-service.ts";

// Mock global fetch
const originalFetch = globalThis.fetch;

Deno.test("analyzeImageWithClaude returns properly parsed data", async () => {
  try {
    // Mock Deno.env
    const originalEnv = Deno.env;
    Object.defineProperty(Deno, "env", { 
      value: {
        get: (key: string) => key === "ANTHROPIC_API_KEY" ? "test-api-key" : originalEnv.get(key)
      }
    });
    
    // Mock the fetch API
    globalThis.fetch = stub(globalThis, "fetch", async () => {
      return {
        ok: true,
        json: async () => ({ 
          content: [{ 
            type: "text", 
            text: `\`\`\`json
            [
              {
                "SKUBrand": "Test Brand",
                "SKUFullName": "Test Product",
                "NumberFacings": 3,
                "PriceSKU": "$5.99",
                "ShelfSection": "middle",
                "BoundingBox": { "confidence": 0.95 }
              }
            ]
            \`\`\``
          }]
        }),
        text: async () => "",
        blob: async () => new Blob([new Uint8Array([0, 1, 2, 3])])
      } as Response;
    });

    // Test the function
    const result = await analyzeImageWithClaude("https://example.com/test-image.jpg", "test-request-id");
    
    // Assertions
    assertEquals(Array.isArray(result), true);
    assertEquals(result.length, 1);
    assertEquals(result[0].SKUBrand, "Test Brand");
    assertEquals(result[0].SKUFullName, "Test Product");
    assertEquals(result[0].NumberFacings, 3);
    assertEquals(result[0].PriceSKU, "$5.99");
    assertEquals(result[0].ShelfSection, "middle");
    assertExists(result[0].BoundingBox);
    assertEquals(result[0].BoundingBox.confidence, 0.95);
    
  } finally {
    // Restore originals
    restore();
    globalThis.fetch = originalFetch;
  }
});

Deno.test("analyzeImageWithClaude handles fetch errors", async () => {
  try {
    // Mock Deno.env
    const originalEnv = Deno.env;
    Object.defineProperty(Deno, "env", { 
      value: {
        get: (key: string) => key === "ANTHROPIC_API_KEY" ? "test-api-key" : originalEnv.get(key)
      }
    });
    
    // Mock fetch to simulate error
    globalThis.fetch = stub(globalThis, "fetch", async () => {
      throw new Error("Network error");
    });

    // Test that it throws an error
    await assertRejects(
      async () => await analyzeImageWithClaude("https://example.com/test-image.jpg", "test-request-id"),
      Error,
      "Network error"
    );
    
  } finally {
    restore();
    globalThis.fetch = originalFetch;
  }
});

Deno.test("analyzeImageWithClaude handles API errors", async () => {
  try {
    // Mock Deno.env
    const originalEnv = Deno.env;
    Object.defineProperty(Deno, "env", { 
      value: {
        get: (key: string) => key === "ANTHROPIC_API_KEY" ? "test-api-key" : originalEnv.get(key)
      }
    });
    
    // Mock fetch to simulate API error
    globalThis.fetch = stub(globalThis, "fetch", async () => {
      return {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        text: async () => "Rate limit exceeded"
      } as Response;
    });

    // Test that it throws an error
    await assertRejects(
      async () => await analyzeImageWithClaude("https://example.com/test-image.jpg", "test-request-id"),
      Error,
      "Claude API returned error: 429"
    );
    
  } finally {
    restore();
    globalThis.fetch = originalFetch;
  }
});
