
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
                text: `🧠 Claude Prompt — Shelf Image Analysis with Integrated Metadata and Confidence Scoring

You are a visual retail analysis assistant helping merchandizers assess shelf conditions from store photos.

Given an image of a shelf, extract structured merchandising data for each SKU, along with related metadata. Return the result in a JSON format.

---

### 🔍 For each distinct SKU visible or tagged in the image, extract:

* **SKUFullName**: Full product name as written on the label (e.g., "Coca-Cola 500ml Bottle")
* **SKUBrand**: Brand only (e.g., "Coca-Cola")
* **ProductCategory1**: Main product category, chosen based on the predefined list below
* **ProductCategory2**: Subcategory, also chosen based on the predefined list
* **ProductCategory3**: Leave as \`null\` for now
* **NumberFacings**: How many visible facings of this product are on the shelf (front-facing only)
* **PriceSKU**: Price of this SKU from the visible tag (e.g., "$1.29"). Use \`null\` if not visible
* **ShelfSection**: Location within the shelf area (e.g., "Top Left", "Middle Right", etc.)
* **OutofStock**: \`true\` if a shelf tag for this SKU is present but no product is in that spot; otherwise \`false\`
* **Misplaced**: \`true\` if the visible product is **not behind its correct price/tag** (e.g., a different product is in its place)
* **BoundingBox**: The coordinates of one representative facing, in the form:
  \`{ "x": INT, "y": INT, "width": INT, "height": INT, "confidence": FLOAT }\`, where \`confidence\` ranges from 0 (no confidence) to 1 (full confidence) and reflects the reliability of the recognition. Use \`null\` if the SKU is only tagged, not visible.
* **Tags**: Any visible labels, signs, or indicators (e.g., "Discount", "Out of Stock", "2 for 1")

---

### 📤 **Output JSON Format:**

\`\`\`json
{
  "SKUs": [
    {
      "SKUFullName": "Coca-Cola 500ml Bottle",
      "SKUBrand": "Coca-Cola",
      "ProductCategory1": "Drinks",
      "ProductCategory2": "Soft Drinks",
      "ProductCategory3": null,
      "NumberFacings": 4,
      "PriceSKU": "$1.29",
      "ShelfSection": "Middle Left",
      "OutofStock": false,
      "Misplaced": false,
      "BoundingBox": { "x": 120, "y": 340, "width": 80, "height": 200, "confidence": 0.95 },
      "Tags": ["Discount"]
    },
    {
      "SKUFullName": "Pepsi 500ml Bottle",
      "SKUBrand": "Pepsi",
      "ProductCategory1": "Drinks",
      "ProductCategory2": "Soft Drinks",
      "ProductCategory3": null,
      "NumberFacings": 0,
      "PriceSKU": "$1.25",
      "ShelfSection": "Bottom Right",
      "OutofStock": true,
      "Misplaced": false,
      "BoundingBox": null,
      "Tags": ["Price Label Visible"]
    },
    {
      "SKUFullName": "Sprite 500ml Bottle",
      "SKUBrand": "Sprite",
      "ProductCategory1": "Drinks",
      "ProductCategory2": "Soft Drinks",
      "ProductCategory3": null,
      "NumberFacings": 2,
      "PriceSKU": "$1.20",
      "ShelfSection": "Middle Center",
      "OutofStock": false,
      "Misplaced": true,
      "BoundingBox": { "x": 310, "y": 370, "width": 85, "height": 190, "confidence": 0.88 },
      "Tags": []
    }
  ]
}
\`\`\`

---

### 📌 **Important Guidelines:**

* Use OCR to read price tags and product names when needed
* Only count products clearly visible from the front
* A SKU is Misplaced if it's behind the wrong price label or tag
* A SKU is OutofStock if the tag is present but the product is missing
* If information is not available or unclear, use \`null\` or leave the array empty
* The field \`ProductCategory3\` should be kept \`null\`. The fields \`ProductCategory1\` and \`ProductCategory2\` must be assigned based on the following official category list:

\`\`\`json
[
  {"ProductCategory1": "Drinks", "ProductCategory2": "Alcoholic Drinks"},
  {"ProductCategory1": "Drinks", "ProductCategory2": "Hot Drinks"},
  {"ProductCategory1": "Drinks", "ProductCategory2": "Soft Drinks"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Cooking ingredients and meals"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Dairy products and alternatives"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Fresh food"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Health and wellness"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Nutritition"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Snacks"},
  {"ProductCategory1": "Food and nutrition", "ProductCategory2": "Staple foods"},
  {"ProductCategory1": "Health and beauty", "ProductCategory2": "Beauty and personal care"},
  {"ProductCategory1": "Health and beauty", "ProductCategory2": "Consumer health"},
  {"ProductCategory1": "Health and beauty", "ProductCategory2": "Eyewear"},
  {"ProductCategory1": "Health and beauty", "ProductCategory2": "Tissue and hygiene"},
  {"ProductCategory1": "Home products", "ProductCategory2": "Home and Garden"},
  {"ProductCategory1": "Home products", "ProductCategory2": "Home Care"},
  {"ProductCategory1": "Home products", "ProductCategory2": "Pet Care"},
  {"ProductCategory1": "Appliances and electronics", "ProductCategory2": "Consumer Appliances"},
  {"ProductCategory1": "Appliances and electronics", "ProductCategory2": "Consumer Electronics"},
  {"ProductCategory1": "Appliances and electronics", "ProductCategory2": "Toys and Games"},
  {"ProductCategory1": "Luxury and fashion", "ProductCategory2": "Apparel and footwear"},
  {"ProductCategory1": "Luxury and fashion", "ProductCategory2": "Luxury goods"},
  {"ProductCategory1": "Luxury and fashion", "ProductCategory2": "Personal accessories"}
]
\`\`\`

---

You must respond only with a valid JSON object as shown. Do not include explanations or additional commentary.`
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
      
      // Use regex to extract JSON object from possible text
      const jsonMatch = textContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        // Extract the SKUs array from the response
        analysisData = parsedData.SKUs || [];
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
