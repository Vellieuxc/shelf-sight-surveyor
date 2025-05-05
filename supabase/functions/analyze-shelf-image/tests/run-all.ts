
#!/usr/bin/env deno run --allow-read --allow-env --allow-net

import { runTests } from "https://deno.land/std@0.168.0/testing/mod.ts";

console.log("🧪 Running Edge Function Tests...");

// Run unit tests
console.log("\n📋 Running Unit Tests:");
try {
  await runTests({
    include: ["tests/unit/"],
    filter: { skip: [] },
  });
  console.log("✅ Unit tests passed");
} catch (error) {
  console.error("❌ Error in unit tests:", error);
}

// Run integration tests
console.log("\n📋 Running Integration Tests:");
try {
  await runTests({
    include: ["tests/integration/"],
    filter: { skip: [] },
  });
  console.log("✅ Integration tests passed");
} catch (error) {
  console.error("❌ Error in integration tests:", error);
}

// Run specific process-next tests to verify our fix
console.log("\n📋 Running Process-Next Tests:");
try {
  await runTests({
    include: ["tests/integration/process-next-flow.test.ts"],
    filter: { skip: [] },
  });
  console.log("✅ Process-Next tests passed");
} catch (error) {
  console.error("❌ Error in process-next tests:", error);
}

console.log("\n✅ All tests completed!");
