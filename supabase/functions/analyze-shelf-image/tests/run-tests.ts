
import { runTests } from "https://deno.land/std@0.168.0/testing/mod.ts";

console.log("Running Claude service tests...");

// Run all tests and exit with appropriate code
runTests({
  // Include both claude-service tests and unit tests for transformers
  include: /claude-service|transformers/,
  failFast: true,
}).then(({ completed, filtered, ignored, measured, passed, failed }) => {
  console.log(`
Test Results:
  Completed: ${completed}
  Passed:    ${passed}
  Failed:    ${failed}
  Filtered:  ${filtered}
  Ignored:   ${ignored}
  Measured:  ${measured}
  `);
  
  if (failed > 0) {
    console.error("❌ Some tests failed");
    Deno.exit(1);
  } else {
    console.log("✅ All tests passed");
    Deno.exit(0);
  }
});
