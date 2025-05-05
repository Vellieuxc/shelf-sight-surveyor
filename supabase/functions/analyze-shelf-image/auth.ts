
import { AuthError } from "./error-handler.ts";

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
    
    // Further token validation could be added here
    const token = authHeader.replace('Bearer ', '');
    if (token.length < 10) {
      console.error(`Invalid token length [${requestId}]`);
      throw new AuthError("Invalid authentication token");
    }
  }
}
