
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { monitorClaudeCall, getMetrics } from "../../monitoring.ts";

Deno.test("monitorClaudeCall should track successful calls", async () => {
  const mockFunction = async () => {
    return { result: "success" };
  };
  
  const result = await monitorClaudeCall(mockFunction);
  assertEquals(result.result, "success");
  
  const metrics = getMetrics();
  assertEquals(metrics.totalCalls >= 1, true);
  assertEquals(metrics.successfulCalls >= 1, true);
  assertEquals(typeof metrics.averageResponseTime, "number");
  assertExists(metrics.successRate);
});

Deno.test("monitorClaudeCall should track failed calls", async () => {
  const mockFailFunction = async () => {
    throw new Error("Test error");
  };
  
  // Get metrics before the failed call
  const metricsBefore = getMetrics();
  const failedCallsBefore = metricsBefore.failedCalls;
  
  try {
    await monitorClaudeCall(mockFailFunction);
  } catch (error) {
    assertEquals(error.message, "Test error");
  }
  
  // Verify metrics were updated
  const metricsAfter = getMetrics();
  assertEquals(metricsAfter.failedCalls, failedCallsBefore + 1);
});

Deno.test("monitorClaudeCall should measure response time", async () => {
  const mockDelayFunction = async () => {
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 50));
    return { result: "delayed" };
  };
  
  await monitorClaudeCall(mockDelayFunction);
  
  const metrics = getMetrics();
  assertEquals(metrics.totalResponseTime > 0, true);
  
  // At least one response time should be recorded
  assertEquals(metrics.lastTenResponseTimes.length > 0, true);
  
  // Response time should be at least 50ms
  const lastResponseTime = metrics.lastTenResponseTimes[metrics.lastTenResponseTimes.length - 1];
  assertEquals(lastResponseTime >= 50, true);
});
