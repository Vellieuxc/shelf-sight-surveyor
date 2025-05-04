
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsOptions, corsHeaders } from "./cors.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";
import { handleError } from "./error-handler.ts";

serve(async (req) => {
  console.log("Edge Function received request:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests properly
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const requestData = await req.json().catch(error => {
      console.error("Failed to parse request body:", error);
      throw new Error("Invalid request body format");
    });
    
    const { imageUrl, imageId } = requestData;
    
    if (!imageUrl) {
      console.error("Image URL is required but was not provided");
      throw new Error("Image URL is required");
    }

    console.log(`Processing analysis for image: ${imageId}`);
    console.log(`Image URL: ${imageUrl}`);

    // Call the Claude service to analyze the image
    const analysisData = await analyzeImageWithClaude(imageUrl);

    console.log("Successfully extracted and parsed data from Claude response");
    
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
    
    // Return the response with CORS headers
    return new Response(JSON.stringify({ success: true, data: transformedData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return handleError(error);
  }
});
