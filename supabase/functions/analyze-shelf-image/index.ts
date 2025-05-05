
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateRequestId } from "./utils.ts";
import { handleAnalyzeRequest } from "./analyze-handler.ts";
import { handleStatusCheck } from "./status-handler.ts";
import { handleProcessNext } from "./queue-processor.ts";
import { corsHeaders } from "./cors.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

console.log(`Shelf Image Analysis Function initialized`);

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: securityHeaders,
    });
  }

  // Generate a unique request ID for tracking
  const requestId = generateRequestId();
  console.log(`Request received [${requestId}]: ${req.url}`);
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    console.log(`Path: ${url.pathname} [${requestId}]`);
    
    // Main analyze endpoint
    if (path === 'analyze-shelf-image' || !path) {
      return handleAnalyzeRequest(req, requestId);
    }
    
    // Status check endpoint
    if (path === 'status') {
      return handleStatusCheck(req, requestId);
    }
    
    // Process next endpoint
    if (path === 'process-next') {
      return handleProcessNext(req, requestId);
    }
    
    // Unknown endpoint
    console.error(`Unknown endpoint requested [${requestId}]: ${path}`);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Endpoint not found",
      requestId
    }), {
      status: 404,
      headers: securityHeaders,
    });
    
  } catch (error) {
    console.error(`Unhandled error in edge function [${requestId}]:`, error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || "Unknown error occurred",
      requestId
    }), {
      status: 500,
      headers: securityHeaders,
    });
  }
});
