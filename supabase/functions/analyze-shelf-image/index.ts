
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define proper CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log("Edge Function received request:", req.method);
  
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
    const { imageUrl, imageId } = await req.json();
    if (!imageUrl) {
      console.error("Image URL is required but was not provided");
      throw new Error("Image URL is required");
    }

    console.log(`Processing analysis for image: ${imageId}`);

    // Make the request to the Anthropic API
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
                text: "This is a picture of a retail store shelf. Please analyze the products visible and extract the following information structured as a JSON array:\n\n" +
                      "1. sku_name: The name of each product\n" +
                      "2. brand: The brand name\n" +
                      "3. sku_count: Approximate number of units visible for each product\n" +
                      "4. sku_price: The current price of the product\n" +
                      "5. sku_price_pre_promotion: Original price before promotion (only if a promotion is visible)\n" +
                      "6. sku_price_post_promotion: Price after promotion (only if a promotion is visible)\n" +
                      "7. empty_space_estimate: For empty shelf areas, estimate the percentage of empty space (create a separate entry with sku_name 'Empty' and this field)\n\n" +
                      "Please return your results ONLY as a clean, properly formatted JSON array with no additional text. Each object should only include fields that are relevant (don't include empty fields)."
              },
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                  media_type: "image/jpeg"
                }
              }
            ]
          }
        ]
      })
    });

    console.log("Response received from Anthropic API");
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Claude API error:", errorData);
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
      
      // Use regex to extract JSON array from possible text
      const jsonMatch = textContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0]);
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
