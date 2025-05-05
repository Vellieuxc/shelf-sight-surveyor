
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsOptions, corsHeaders } from "./cors.ts";
import { handleError } from "./error-handler.ts";
import { generateRequestId } from "./utils.ts";
import { authenticateRequest } from "./auth.ts";
import { handleAnalyzeRequest } from "./analyze-handler.ts";
import { handleStatusCheck } from "./status-handler.ts";
import { handleProcessNext } from "./queue-processor.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// Main handler that orchestrates the analysis process
serve(async (req) => {
  // Generate a unique request ID for this request
  const requestId = generateRequestId();
  console.log(`Edge Function received request [${requestId}]:`, req.method);
  console.log(`Request headers [${requestId}]:`, Object.fromEntries(req.headers.entries()));
  
  // Add request rate limiting (basic implementation)
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Handle CORS preflight requests properly
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // Parse URL to determine which operation to perform
    const url = new URL(req.url);
    const path = url.pathname;
    console.log(`Path: ${path} [${requestId}]`);
    
    // Validate request size to prevent abuse (10MB max)
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 10 * 1024 * 1024) {
      throw new Error("Request payload too large");
    }
    
    // Authenticate the request (except for status endpoint which has different auth)
    if (!path.includes('/status')) {
      await authenticateRequest(req, requestId);
    }
    
    // Route to appropriate handler based on the path
    if (path.includes('/status')) {
      return await handleStatusCheck(req, requestId);
    } else if (path.includes('/process-next')) {
      console.log(`Routing to process-next handler [${requestId}]`);
      return await handleProcessNext(req, requestId);
    } else {
      return await handleAnalyzeRequest(req, requestId);
    }
  } catch (error) {
    return handleError(error, requestId);
  }
});
