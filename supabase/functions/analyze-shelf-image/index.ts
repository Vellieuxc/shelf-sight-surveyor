
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log("Edge Function received request:", req.method);
  console.log("Request headers:", Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests properly
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request with CORS headers");
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      console.error("ANTHROPIC_API_KEY is not configured");
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    console.log("Parsing request body");
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

    // Make the request to the Anthropic API with an improved prompt
    console.log("Sending request to Anthropic API");
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "You are a retail merchandising expert analyzing a product shelf image. Please identify all products visible and extract the following information as precisely as possible in a JSON array:\n\n" +
                      "1. sku_name: The full and exact product name including variant details, size, formulation, etc.\n" +
                      "2. brand: The primary brand name only (do not include parent company or sub-brands here)\n" +
                      "3. sku_count: Number of product facings visible (how many units of this exact product are facing front on the shelf, not total inventory)\n" +
                      "4. sku_price: The current price shown on shelf labels (if visible). If not visible, omit this field.\n" +
                      "5. sku_price_pre_promotion: Original price before promotion (only if a promotional price is visible)\n" +
                      "6. sku_price_post_promotion: Price after promotion (only if a promotional price is visible)\n" +
                      "7. sku_position: Position on the shelf (Top, Middle, or Bottom)\n" +
                      "8. empty_space_estimate: For empty shelf areas, estimate the percentage of empty space\n\n" +
                      "Additional guidelines:\n" +
                      "- Focus on clearly visible products - only include products you can confidently identify\n" +
                      "- For products with multiple facings of the same item, include them as a single entry with the appropriate sku_count\n" +
                      "- If a product is partially obscured but clearly identifiable, include it\n" +
                      "- For empty shelf areas, create entries with sku_name 'Empty Space' and the empty_space_estimate field\n" +
                      "- If you cannot clearly read a price, it's better to omit that field than guess\n" +
                      "- Do not make assumptions about products you cannot clearly see\n\n" +
                      "Please return ONLY a properly formatted JSON array with no additional text. Each object should only include fields that you can identify with high confidence."
              },
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl
                }
              }
            ]
          }
        ]
      })
    });

    console.log("Response received from Anthropic API");
    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error response text");
      console.error("Claude API error response:", errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      console.error("Claude API error details:", errorData);
      throw new Error(`Claude API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Claude API response received successfully");
    
    // Extract JSON from Claude's response
    let analysisData = [];
    try {
      // Find JSON in Claude's response
      const textContent = data.content[0].text;
      console.log("Parsing Claude response as JSON");
      console.log("Claude raw response:", textContent);
      
      // Use regex to extract JSON array from possible text
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
        console.log("Successfully parsed JSON data from Claude's response");
      } else {
        console.error("Could not extract JSON data from Claude's response");
        throw new Error("Could not extract JSON data from Claude's response");
      }
    } catch (error) {
      console.error("Error parsing Claude response as JSON:", error);
      throw new Error("Failed to parse analysis data from Claude response");
    }

    console.log("Successfully extracted and parsed data from Claude response");
    
    // Return the response with CORS headers
    return new Response(JSON.stringify({ success: true, data: analysisData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-shelf-image function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
