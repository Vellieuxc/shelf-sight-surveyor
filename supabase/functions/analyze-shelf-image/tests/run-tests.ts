
#!/usr/bin/env deno run --allow-read --allow-env

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

console.log("\n✅ All tests completed!");
