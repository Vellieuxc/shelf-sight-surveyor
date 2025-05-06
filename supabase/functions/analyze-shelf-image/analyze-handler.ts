
import { generateRequestId } from "./utils.ts";
import { corsHeaders } from "./cors.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

/**
 * Optimized handler for analysis requests with direct processing
 * Improved error handling and response formatting
 */
export async function handleAnalyzeRequest(req: Request, requestId: string): Promise<Response> {
  console.log(`Path: /analyze-shelf-image [${requestId}]`);
  
  try {
    // Extract request data
    const { imageUrl, imageId, includeConfidence = true } = await req.json();
    
    // Validate inputs
    if (!imageUrl || !imageId) {
      console.error(`Missing required parameters [${requestId}]`);
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required parameters: imageUrl and imageId",
        requestId
      }), {
        status: 400,
        headers: securityHeaders
      });
    }
    
    console.log(`Analyzing image directly [${requestId}]: ${imageId}`);
    console.log(`Image URL [${requestId}]: ${imageUrl}`);
    
    try {
      // Analyze the image directly with Claude
      console.log(`Starting Claude analysis [${requestId}]`);
      const startTime = performance.now();
      const analysisData = await analyzeImageWithClaude(imageUrl, requestId);
      const endTime = performance.now();
      const processingTimeMs = Math.round(endTime - startTime);
      
      console.log(`Analysis completed in ${processingTimeMs}ms [${requestId}]`);
      
      // Return structured data response
      return new Response(JSON.stringify({ 
        success: true,
        status: "completed",
        imageId,
        data: analysisData,
        processingTime: processingTimeMs,
        requestId
      }), {
        headers: securityHeaders,
        status: 200
      });
      
    } catch (error) {
      console.error(`Error analyzing image [${requestId}]:`, error);
      
      // Enhanced error response with more details
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Analysis error: ${error.message}`,
        errorType: error.name || "Unknown",
        imageId,
        requestId
      }), {
        status: 500,
        headers: securityHeaders,
      });
    }
  } catch (error) {
    console.error(`Error parsing request [${requestId}]:`, error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Request parsing error: ${error.message}`,
      requestId
    }), {
      status: 400,
      headers: securityHeaders,
    });
  }
}
