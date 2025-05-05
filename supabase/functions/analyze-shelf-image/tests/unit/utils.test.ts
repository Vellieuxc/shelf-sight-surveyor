
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { generateRequestId } from "../../utils.ts";

Deno.test("generateRequestId should create a 32-character hexadecimal string", () => {
  const requestId = generateRequestId();
  assertEquals(typeof requestId, "string");
  assertEquals(requestId.length, 32);
  // Check if it's a valid hexadecimal string
  const hexRegex = /^[0-9a-f]+$/;
  assertEquals(hexRegex.test(requestId), true);
});
