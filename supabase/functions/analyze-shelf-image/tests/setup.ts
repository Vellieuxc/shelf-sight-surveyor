
// Test setup file for shared test utilities and mocks

// Mock KV store for testing
export const mockKvStore: Record<string, any> = {};

// Mock Deno.openKv
export function mockDenoKv() {
  const originalOpenKv = Deno.openKv;
  
  Deno.openKv = async () => {
    return {
      get: async (key: string[]) => {
        const keyStr = key.join(':');
        return { value: mockKvStore[keyStr] || null };
      },
      set: async (key: string[], value: any) => {
        const keyStr = key.join(':');
        mockKvStore[keyStr] = value;
        return { ok: true };
      },
      list: async ({ prefix }: { prefix: string[] }) => {
        const prefixStr = prefix.join(':');
        const entries = Object.entries(mockKvStore)
          .filter(([key]) => key.startsWith(prefixStr))
          .map(([key, value]) => ({ 
            key: key.split(':'), 
            value 
          }));
        
        return {
          [Symbol.asyncIterator]: async function* () {
            for (const entry of entries) {
              yield entry;
            }
          }
        };
      },
      close: () => {}
    };
  };
  
  return () => {
    // Cleanup function
    Deno.openKv = originalOpenKv;
  };
}

// Helper to create mock requests
export function createMockRequest(method: string, body?: any): Request {
  return {
    method,
    headers: new Headers({
      "Content-Type": "application/json",
      "Authorization": "Bearer test-token"
    }),
    json: () => Promise.resolve(body)
  } as unknown as Request;
}

// Setup environment variables for testing
export function setupTestEnv() {
  const originalEnv = Deno.env;
  
  Deno.env = {
    get: (key: string) => {
      if (key === "ANTHROPIC_API_KEY") return "test-api-key";
      if (key === "REQUIRE_AUTH") return "false";
      return originalEnv.get(key);
    },
    set: originalEnv.set,
    delete: originalEnv.delete,
    toObject: originalEnv.toObject
  };
  
  return () => {
    Deno.env = originalEnv;
  };
}

// Clear mock KV store
export function clearMockKvStore() {
  for (const key in mockKvStore) {
    delete mockKvStore[key];
  }
}
