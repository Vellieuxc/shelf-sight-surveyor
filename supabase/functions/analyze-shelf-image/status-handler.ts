
import { corsHeaders } from "./cors.ts";
import { authenticateRequest } from "./auth.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

/**
 * Status check endpoint with enhanced security
 * @param req The request object
 * @param requestId Unique request identifier for tracing
 */
export async function handleStatusCheck(req: Request, requestId: string): Promise<Response> {
  console.log(`Status check request [${requestId}]`);
  
  try {
    // Verify authentication/request validity 
    await authenticateRequest(req, requestId);
    
    // We could add performance metrics, request counts, etc here
    const statusData = {
      status: "operational",
      version: "1.2.0",
      requestsProcessed: 0, // This could be replaced with actual metrics
      uptime: "unknown", // This could be dynamically calculated
      timestamp: new Date().toISOString(),
      requestId
    };
    
    return new Response(JSON.stringify(statusData), {
      headers: securityHeaders,
      status: 200
    });
  } catch (error) {
    console.error(`Status check error [${requestId}]:`, error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Status check failed",
      requestId
    }), {
      headers: securityHeaders,
      status: error.status || 500,
    });
  }
}
