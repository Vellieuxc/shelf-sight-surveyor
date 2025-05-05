
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsOptions, corsHeaders } from "./cors.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";
import { handleError, ValidationError, AuthError } from "./error-handler.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Helper function to generate request IDs
function generateRequestId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

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
    const requestData = await req.json().catch(error => {
      console.error(`Failed to parse request body [${requestId}]:`, error);
      throw new ValidationError("Invalid request body format");
    });
    
    const { imageUrl, imageId } = requestData;
    
    if (!imageUrl) {
      console.error(`Image URL is required but was not provided [${requestId}]`);
      throw new ValidationError("Image URL is required");
    }

    // Check for authentication headers if required
    const authHeader = req.headers.get('authorization');
    if (!authHeader && process.env.REQUIRE_AUTH === 'true') {
      throw new AuthError("Authentication required");
    }

    console.log(`Processing analysis for image [${requestId}]: ${imageId}`);
    console.log(`Image URL [${requestId}]: ${imageUrl}`);

    // Call the Claude service to analyze the image
    const analysisData = await analyzeImageWithClaude(imageUrl, requestId);

    console.log(`Successfully extracted and parsed data from Claude response [${requestId}]`);
    
    // Transform the data to match our expected format
    const transformedData = analysisData.map(item => {
      return {
        sku_name: item.SKUFullName || '',
        brand: item.SKUBrand || '',
        sku_count: item.NumberFacings || 0,
        sku_price: parseFloat(item.PriceSKU?.replace(/[^0-9.]/g, '')) || 0,
        sku_position: item.ShelfSection || '',
        sku_confidence: item.BoundingBox?.confidence ? 
          (item.BoundingBox.confidence >= 0.9 ? 'high' : 
           item.BoundingBox.confidence >= 0.7 ? 'mid' : 'low') : 
          'unknown',
        empty_space_estimate: item.OutofStock === true ? 100 : undefined
      };
    });
    
    // Return the response with CORS headers and request ID
    return new Response(JSON.stringify({ 
      success: true, 
      data: transformedData,
      requestId 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleError(error, requestId);
  }
});
