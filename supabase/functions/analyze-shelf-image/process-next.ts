
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleProcessNext } from "./queue-processor.ts";
import { generateRequestId } from "./utils.ts";
import { corsHeaders } from "./cors.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// Simple endpoint to manually trigger queue processing
serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: securityHeaders,
    });
  }

  const requestId = generateRequestId();
  console.log(`Process-next function invoked [${requestId}]`);
  
  try {
    const result = await handleProcessNext(req, requestId);
    
    console.log(`Process-next completed [${requestId}]`);
    
    return result;
  } catch (error) {
    console.error(`Error in process-next [${requestId}]:`, error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Failed to process next job",
      error: error.message,
      requestId
    }), {
      status: 500,
      headers: securityHeaders,
    });
  }
});
