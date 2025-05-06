
import { AuthError } from "./error-handler.ts";

// Enhanced security parameters
const MIN_TOKEN_LENGTH = 24;
const MAX_TOKEN_AGE_MS = 3600000; // 1 hour
const MAX_TOKEN_USE_COUNT = 3; // Maximum number of times a token can be used

// In-memory token usage tracker (would be replaced by a proper store in production)
const tokenUsage: Record<string, { count: number, lastUsed: number }> = {};

// Authenticate the request with enhanced security
export async function authenticateRequest(req: Request, requestId: string): Promise<void> {
  const authHeader = req.headers.get('authorization');
  
  // Enhanced authentication check
  if (Deno.env.get('REQUIRE_AUTH') === 'true') {
    if (!authHeader) {
      console.error(`Authentication required but not provided [${requestId}]`);
      throw new AuthError("Authentication required");
    }
    
    // Validate the auth header format
    if (!authHeader.startsWith('Bearer ')) {
      console.error(`Invalid authentication format [${requestId}]`);
      throw new AuthError("Invalid authentication format");
    }
    
    // Further token validation
    const token = authHeader.replace('Bearer ', '');
    
    // Validate token length for basic security
    if (token.length < MIN_TOKEN_LENGTH) {
      console.error(`Invalid token length [${requestId}]`);
      throw new AuthError("Invalid authentication token");
    }
    
    // Check for token reuse - enhanced to track usage count
    try {
      // Create a token fingerprint (hash would be better in production)
      const tokenFingerprint = token.substring(0, 16);
      const now = Date.now();
      
      // Check if token has been used before
      if (tokenUsage[tokenFingerprint]) {
        const usage = tokenUsage[tokenFingerprint];
        
        // Check if token is expired
        if (now - usage.lastUsed > MAX_TOKEN_AGE_MS) {
          console.error(`Token expired [${requestId}]`);
          delete tokenUsage[tokenFingerprint]; // Clean up expired token
          throw new AuthError("Authentication token expired");
        }
        
        // Check for replay attacks (token used too many times)
        if (usage.count >= MAX_TOKEN_USE_COUNT) {
          console.error(`Token usage limit exceeded [${requestId}]`);
          throw new AuthError("Authentication token usage limit exceeded");
        }
        
        // Update token usage
        usage.count++;
        usage.lastUsed = now;
      } else {
        // First time seeing this token
        tokenUsage[tokenFingerprint] = { count: 1, lastUsed: now };
      }
      
      // Extract timestamp from request headers if present (for token age verification)
      const timestampHeader = req.headers.get('x-request-timestamp');
      if (timestampHeader) {
        const timestamp = parseInt(timestampHeader, 10);
        
        // Reject requests with very old timestamps (replay attack prevention)
        if (now - timestamp > MAX_TOKEN_AGE_MS) {
          console.error(`Request timestamp too old [${requestId}]`);
          throw new AuthError("Request expired");
        }
      }
      
      // Clean up old tokens periodically (simple garbage collection)
      if (Object.keys(tokenUsage).length > 100) {
        cleanupOldTokens();
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      
      console.error(`Error validating token [${requestId}]:`, error);
      throw new AuthError("Authentication validation failed");
    }
  }
}

// Helper function to clean up expired tokens
function cleanupOldTokens() {
  const now = Date.now();
  Object.entries(tokenUsage).forEach(([fingerprint, usage]) => {
    if (now - usage.lastUsed > MAX_TOKEN_AGE_MS) {
      delete tokenUsage[fingerprint];
    }
  });
}
