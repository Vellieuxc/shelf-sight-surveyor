
import { assertEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { callWithRetry, withClaudeRetry } from "../../retry.ts";

Deno.test("callWithRetry should retry on specified errors", async () => {
  let attempts = 0;
  
  const testFn = async () => {
    attempts++;
    if (attempts < 3) {
      const error = new Error("Temporary error");
      error.name = "ExternalServiceError";
      throw error;
    }
    return "success";
  };
  
  const result = await callWithRetry(testFn);
  assertEquals(result, "success");
  assertEquals(attempts, 3);
});

Deno.test("callWithRetry should respect max retries", async () => {
  let attempts = 0;
  
  const testFn = async () => {
    attempts++;
    const error = new Error("Always fails");
    error.name = "ExternalServiceError";
    throw error;
  };
  
  await assertRejects(
    async () => await callWithRetry(testFn, { maxRetries: 2 }),
    Error,
    "Always fails"
  );
  
  assertEquals(attempts, 3); // Initial + 2 retries
});

Deno.test("callWithRetry should not retry on non-retryable errors", async () => {
  let attempts = 0;
  
  const testFn = async () => {
    attempts++;
    const error = new Error("Validation error");
    error.name = "ValidationError";
    throw error;
  };
  
  await assertRejects(
    async () => await callWithRetry(testFn),
    Error,
    "Validation error"
  );
  
  assertEquals(attempts, 1); // No retries
});

Deno.test("withClaudeRetry should handle Claude-specific errors", async () => {
  let attempts = 0;
  
  const testFn = async () => {
    attempts++;
    if (attempts < 2) {
      const error = new Error("Claude API rate limit exceeded");
      error.name = "ExternalServiceError";
      throw error;
    }
    return "success";
  };
  
  const result = await withClaudeRetry(testFn, "test-request-id");
  assertEquals(result, "success");
  assertEquals(attempts, 2);
});
