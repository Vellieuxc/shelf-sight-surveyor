
#!/usr/bin/env deno run --allow-read --allow-env --allow-net

import { runTests } from "https://deno.land/std@0.168.0/testing/mod.ts";

console.log("🧪 Running Edge Function Tests...");

// Define test modules to run in order of importance
const testModules = [
  // Unit tests for critical components
  "tests/unit/utils.test.ts",
  "tests/unit/transformers.test.ts",
  "tests/unit/claude-service.test.ts",
  
  // Additional unit tests
  "tests/unit/validator.test.ts",
  "tests/unit/error-handler.test.ts",
  "tests/unit/monitoring.test.ts",
  "tests/unit/retry.test.ts",
  "tests/unit/queue.test.ts",
  
  // Integration tests
  "tests/integration/error-handling.test.ts",
  "tests/integration/analyze-flow.test.ts",
  "tests/integration/process-next-flow.test.ts",
];

// Run tests in parallel with a concurrency limit
const concurrencyLimit = 3;
const results = [];
const runningTests = [];

for (const module of testModules) {
  // Wait if we've reached concurrency limit
  if (runningTests.length >= concurrencyLimit) {
    await Promise.race(runningTests);
  }
  
  // Start new test and add to running tests
  console.log(`Testing: ${module}`);
  const testPromise = runTests({
    include: [module],
    filter: { skip: [] },
  }).then(result => {
    console.log(`✅ ${module} completed`);
    results.push({ module, success: true });
    
    // Remove this promise from running tests
    const index = runningTests.indexOf(testPromise);
    if (index > -1) {
      runningTests.splice(index, 1);
    }
  }).catch(error => {
    console.error(`❌ ${module} failed:`, error);
    results.push({ module, success: false, error });
    
    // Remove this promise from running tests
    const index = runningTests.indexOf(testPromise);
    if (index > -1) {
      runningTests.splice(index, 1);
    }
  });
  
  runningTests.push(testPromise);
}

// Wait for all remaining tests to complete
await Promise.all(runningTests);

// Summarize results
console.log("\n✅ Test Summary:");
const successful = results.filter(r => r.success).length;
const failed = results.filter(r => !r.success).length;
console.log(`Total: ${results.length}, Passed: ${successful}, Failed: ${failed}`);

if (failed > 0) {
  console.log("\nFailed tests:");
  results.filter(r => !r.success).forEach(result => {
    console.log(`- ${result.module}`);
  });
  Deno.exit(1);
} else {
  console.log("\n✅ All tests completed successfully!");
}
