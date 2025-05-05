
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Helper function to generate request IDs
export function generateRequestId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
}
