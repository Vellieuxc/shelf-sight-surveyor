
import { assertEquals, assertThrows } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { validateRequest } from "../../validator.ts";
import { ValidationError } from "../../error-handler.ts";

// Mock Request object
function createMockRequest(body: any): Request {
  return {
    json: () => Promise.resolve(body)
  } as unknown as Request;
}

Deno.test("validateRequest should validate proper inputs", async () => {
  const mockRequest = createMockRequest({
    imageUrl: "https://example.com/image.jpg",
    imageId: "test-123"
  });
  
  const result = await validateRequest(mockRequest, "test-request-id");
  assertEquals(result.imageUrl, "https://example.com/image.jpg");
  assertEquals(result.imageId, "test-123");
});

Deno.test("validateRequest should throw on missing imageUrl", async () => {
  const mockRequest = createMockRequest({
    imageId: "test-123"
  });
  
  await assertThrows(
    async () => await validateRequest(mockRequest, "test-request-id"),
    ValidationError,
    "Image URL is required"
  );
});

Deno.test("validateRequest should throw on invalid URL", async () => {
  const mockRequest = createMockRequest({
    imageUrl: "not-a-valid-url",
    imageId: "test-123"
  });
  
  await assertThrows(
    async () => await validateRequest(mockRequest, "test-request-id"),
    ValidationError,
    "Image URL must be a valid URL"
  );
});

Deno.test("validateRequest should sanitize inputs", async () => {
  const mockRequest = createMockRequest({
    imageUrl: "https://example.com/image with spaces.jpg",
    imageId: "test-id-with-special-chars!@#$%"
  });
  
  const result = await validateRequest(mockRequest, "test-request-id");
  assertEquals(result.imageUrl, "https://example.com/image%20with%20spaces.jpg");
  assertEquals(result.imageId, "test-id-with-special-chars");
});
