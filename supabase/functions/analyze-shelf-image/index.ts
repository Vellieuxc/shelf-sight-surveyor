
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsOptions, corsHeaders } from "./cors.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";
import { handleError, ValidationError, AuthError } from "./error-handler.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { validateRequest, transformAnalysisData, generateRequestId } from "./utils.ts";
import { monitorClaudeCall } from "./monitoring.ts";

// Main handler that orchestrates the analysis process
serve(async (req) => {
  // Generate a unique request ID for this request
  const requestId = generateRequestId();
  console.log(`Edge Function received request [${requestId}]:`, req.method);
  console.log(`Request headers [${requestId}]:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests properly
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    // Extract and validate the request data
    const validatedData = await validateRequest(req, requestId);
    const { imageUrl, imageId } = validatedData;
    
    // Authenticate the request
    await authenticateRequest(req, requestId);
    
    console.log(`Processing analysis for image [${requestId}]: ${imageId}`);
    console.log(`Image URL [${requestId}]: ${imageUrl}`);

    // Process the image analysis (with performance monitoring)
    const startTime = performance.now();
    const analysisData = await monitorClaudeCall(() => analyzeImageWithClaude(imageUrl, requestId));
    const endTime = performance.now();
    
    console.log(`Analysis completed in ${endTime - startTime}ms [${requestId}]`);
    console.log(`Successfully extracted and parsed data from Claude response [${requestId}]`);
    
    // Transform the data to match our expected format
    const transformedData = transformAnalysisData(analysisData);
    
    // Return the response with CORS headers and request ID
    return new Response(JSON.stringify({ 
      success: true, 
      data: transformedData,
      requestId,
      processingTimeMs: Math.round(endTime - startTime)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleError(error, requestId);
  }
});

// Authenticate the request
async function authenticateRequest(req: Request, requestId: string): Promise<void> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader && Deno.env.get('REQUIRE_AUTH') === 'true') {
    console.error(`Authentication required but not provided [${requestId}]`);
    throw new AuthError("Authentication required");
  }
}
