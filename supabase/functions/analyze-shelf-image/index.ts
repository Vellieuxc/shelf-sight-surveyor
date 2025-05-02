
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

    // Make the request to the Anthropic API with the updated prompt
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
                text: "You are an image analysis expert for merchandising and CPG (Consumer Packaged Goods). Please analyze the attached image of a retail store shelf.\n\n" +
                      "Your objective is to identify all clearly visible products and extract the following information in a JSON array format. Each product should be represented as a JSON object with the following fields:\n\n" +
                      "sku_name: Full and exact product name including variant, size, formulation, etc.\n\n" +
                      "brand: Primary brand name only\n\n" +
                      "sku_position: Position on the shelf (Top, Middle, or Bottom)\n\n" +
                      "sku_count: Number of front-facing units only (do not count inventory behind or non-visible items)\n\n" +
                      "sku_price: Price shown on shelf labels (only if clearly visible)\n\n" +
                      "sku_price_pre_promotion: Original price if a promotional price is shown (only if clearly visible)\n\n" +
                      "sku_price_post_promotion: Promotional price (only if clearly visible)\n\n" +
                      "empty_space_estimate: If the shelf area is empty, estimate the percentage of unoccupied space\n\n" +
                      "sku_confidence: Confidence level of extracted data:\n\n" +
                      "\"high\": All information is clearly visible and identified with certainty\n\n" +
                      "\"mid\": Most information is visible and accurate, but one or two fields may be uncertain\n\n" +
                      "\"low\": Several fields are unclear or partially obscured\n\n" +
                      "At the end of the array, include two summary fields:\n\n" +
                      "total_sku_facings: The sum of all front-facing units identified across all products\n\n" +
                      "quality_picture: Overall assessment of image readability. Choose one:\n\n" +
                      "\"high\": Most labels, product details, and shelf positions are clear and legible\n\n" +
                      "\"mid\": Many elements are readable, but some are blurred, obscured, or hard to distinguish\n\n" +
                      "\"low\": Image is difficult to interpret due to poor quality, glare, angle, or occlusion\n\n" +
                      "Guidelines:\n\n" +
                      "Only include products that are clearly visible and confidently identifiable\n\n" +
                      "Count only front-facing units, do not include inventory behind\n\n" +
                      "Group multiple facings of the same SKU as one object with the appropriate sku_count\n\n" +
                      "If a product is partially visible but clearly identifiable, include it\n\n" +
                      "Do not guess product names, prices, or other details — omit any field that is not clearly visible\n\n" +
                      "For empty shelf sections, include entries with \"sku_name\": \"Empty Space\" and the empty_space_estimate field\n\n" +
                      "Return a single valid JSON array of objects followed by the two summary fields\n\n" +
                      "Output only the JSON, with no extra explanation or text"
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
