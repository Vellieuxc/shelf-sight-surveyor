
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Generate a unique request ID for tracing
export function generateRequestId(): string {
  const buffer = new Uint8Array(8); // 8 bytes = 16 hex chars
  crypto.getRandomValues(buffer);
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Format error message for safe JSON response
export function formatError(error: any): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  return String(error);
}
