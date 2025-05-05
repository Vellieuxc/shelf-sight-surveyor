
#!/usr/bin/env deno run --allow-read --allow-env --allow-net

import { runTests } from "https://deno.land/std@0.168.0/testing/mod.ts";

console.log("Starting comprehensive test suite for shelf image analysis...");

// Import all test modules
import "./unit/validator.test.ts";
import "./unit/error-handler.test.ts";
import "./unit/monitoring.test.ts";
import "./unit/transformers.test.ts";
import "./unit/utils.test.ts";
import "./unit/retry.test.ts";
import "./unit/queue.test.ts";
import "./unit/claude-service.test.ts";
import "./integration/error-handling.test.ts";
import "./integration/analyze-flow.test.ts";
import "./integration/process-next-flow.test.ts";
import "./integration/full-analysis-flow.test.ts";

console.log("All tests imported, starting execution...");

// Run the tests
const command = new Deno.Command(Deno.execPath(), {
  args: [
    "test",
    "--allow-env",
    "--allow-net",
    "--allow-read",
    ".",
  ],
  stdout: "piped",
  stderr: "piped",
});

const { code, stdout, stderr } = await command.output();

const textDecoder = new TextDecoder();
const output = textDecoder.decode(stdout);
const error = textDecoder.decode(stderr);

console.log("Test Output:", output);

if (error) {
  console.error("Test Errors:", error);
}

console.log(`Tests completed with exit code: ${code}`);

if (code === 0) {
  console.log("✅ All tests PASSED");
} else {
  console.error("❌ Some tests FAILED");
}
