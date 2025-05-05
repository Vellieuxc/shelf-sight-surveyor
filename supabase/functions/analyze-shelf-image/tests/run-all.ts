
#!/usr/bin/env deno run --allow-read --allow-env --allow-net

import { runTests } from "https://deno.land/std@0.168.0/testing/mod.ts";

console.log("🧪 Running Edge Function Tests...");

// Run unit tests
console.log("\n📋 Running Unit Tests:");
await runTests({
  include: ["tests/unit/"],
  filter: { skip: [] },
});

// Run integration tests
console.log("\n📋 Running Integration Tests:");
await runTests({
  include: ["tests/integration/"],
  filter: { skip: [] },
});

// Run specific process-next tests to verify our fix
console.log("\n📋 Running Process-Next Tests:");
await runTests({
  include: ["tests/integration/process-next-flow.test.ts"],
  filter: { skip: [] },
});

console.log("\n✅ All tests completed!");
