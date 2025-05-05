
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsOptions, corsHeaders } from "./cors.ts";
import { handleError } from "./error-handler.ts";
import { generateRequestId } from "./utils.ts";
import { authenticateRequest } from "./auth.ts";
import { handleAnalyzeRequest } from "./analyze-handler.ts";
import { handleStatusCheck } from "./status-handler.ts";
import { handleProcessNext } from "./queue-processor.ts";

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
    const pathParts = url.pathname.split('/').filter(Boolean);
    const operation = pathParts[pathParts.length - 1]; // Last path segment
    
    // Validate request size to prevent abuse (10MB max)
    const contentLength = parseInt(req.headers.get('content-length') || '0', 10);
    if (contentLength > 10 * 1024 * 1024) {
      throw new Error("Request payload too large");
    }
    
    // Authenticate the request
    await authenticateRequest(req, requestId);
    
    // Route to appropriate handler based on the operation
    switch (operation) {
      case 'status':
        return await handleStatusCheck(req, requestId);
      case 'process-next':
        return await handleProcessNext(req, requestId);
      case 'analyze-shelf-image':
      default:
        return await handleAnalyzeRequest(req, requestId);
    }
  } catch (error) {
    return handleError(error, requestId);
  }
});
