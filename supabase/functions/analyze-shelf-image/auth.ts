
import { AuthError } from "./error-handler.ts";

// Enhanced security parameters
const MIN_TOKEN_LENGTH = 24;
const MAX_TOKEN_AGE_MS = 3600000; // 1 hour

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
    
    // Check for token reuse - in a real implementation, you would check against a token blacklist
    // This is a placeholder for the concept
    try {
      // Extract timestamp from request headers if present (for token age verification)
      const timestampHeader = req.headers.get('x-request-timestamp');
      if (timestampHeader) {
        const timestamp = parseInt(timestampHeader, 10);
        const now = Date.now();
        
        // Reject requests with very old timestamps
        if (now - timestamp > MAX_TOKEN_AGE_MS) {
          console.error(`Request timestamp too old [${requestId}]`);
          throw new AuthError("Request expired");
        }
      }
    } catch (error) {
      console.error(`Error validating token timestamp [${requestId}]:`, error);
      throw new AuthError("Authentication validation failed");
    }
  }
}
