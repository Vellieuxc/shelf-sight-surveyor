

import { corsHeaders } from "./cors.ts";

// Edge function to analyze a shelf image using Claude
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }
  
  console.log(`Starting image analysis with Claude [${requestId}]`);
  console.log(`Fetching image from URL: ${imageUrl} [${requestId}]`);
  
  try {
    // Fetch and convert image to base64
    const base64Image = await fetchAndConvertImageToBase64(imageUrl, requestId);
    console.log(`Successfully converted image to base64 [${requestId}]`);
    
    // Prepare the Claude API request with the updated prompt
    const prompt = generateComprehensivePrompt(requestId);
    
    // Log the payload size for debugging
    const payloadSize = JSON.stringify({
      model: "claude-3-opus-20240229",
      max_tokens: 4096,
      temperature: 0,
      system: prompt,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: "IMAGE_DATA" // Placeholder to estimate size
              }
            },
            {
              type: "text",
              text: "Analyze this shelf image and provide detailed information about ALL visible products according to the format specified. Be comprehensive and do not omit any visible products."
            }
          ]
        }
      ]
    }).length;
    
    console.log(`Estimated payload size (excluding base64 image): ${payloadSize} bytes [${requestId}]`);
    console.log(`Base64 image size: ${base64Image.length} characters [${requestId}]`);
    
    // Additional logging for diagnosis
    console.log(`Calling Claude API with model: claude-3-opus-20240229 [${requestId}]`);
    
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4096,
        temperature: 0,
        system: prompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: base64Image
                }
              },
              {
                type: "text",
                text: "Analyze this shelf image and provide detailed information about ALL visible products according to the format specified. Be comprehensive and do not omit any visible products."
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      console.error(`Claude API error [${requestId}]: ${response.status} ${response.statusText}`);
      
      // Enhanced error reporting 
      const errorBody = await response.text();
      console.error(`Claude API error details [${requestId}]:`, errorBody);
      
      throw new Error(`Claude API returned error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received response from Claude API [${requestId}]`);
    
    // Debug: Log the raw content from Claude to see what format we're getting
    const content = data.content[0].text;
    console.log(`Raw Claude response [${requestId}]:`, content);
    
    // Try to extract JSON from Claude's response
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsedJson = JSON.parse(jsonMatch[1].trim());
        console.log(`Successfully parsed JSON response [${requestId}]`);
        return parsedJson;
      } catch (parseError) {
        console.error(`Error parsing JSON response [${requestId}]:`, parseError);
        throw new Error(`Failed to parse Claude response: ${parseError.message}`);
      }
    } else {
      console.error(`No JSON found in Claude response [${requestId}]`);
      
      // Try alternative parsing approach - look for any JSON-like structure
      try {
        // Look for any text that looks like JSON object/array
        const jsonObjectMatch = content.match(/(\{[\s\S]*\})/);
        if (jsonObjectMatch && jsonObjectMatch[1]) {
          const parsedJson = JSON.parse(jsonObjectMatch[1].trim());
          console.log(`Successfully parsed JSON using alternative method [${requestId}]`);
          return parsedJson;
        }
        
        // Last resort: attempt to parse the entire response as JSON
        try {
          const parsedJson = JSON.parse(content.trim());
          console.log(`Successfully parsed entire response as JSON [${requestId}]`);
          return parsedJson;
        } catch (e) {
          // If this fails too, throw the original error
          throw new Error("No JSON found in Claude response");
        }
      } catch (e) {
        console.error(`Alternative parsing also failed [${requestId}]:`, e);
        throw new Error("No JSON found in Claude response");
      }
    }
    
  } catch (error) {
    console.error(`Error analyzing image with Claude [${requestId}]:`, error);
    throw error;
  }
}

// Helper function to fetch an image and convert it to base64
async function fetchAndConvertImageToBase64(imageUrl: string, requestId: string): Promise<string> {
  try {
    console.log(`Fetching image with URL: ${imageUrl} [${requestId}]`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`Image fetched successfully, size: ${blob.size} bytes [${requestId}]`);
    
    // Check if the image size is too large
    if (blob.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error(`Image too large: ${(blob.size / (1024 * 1024)).toFixed(2)}MB (max 10MB)`);
    }
    
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Convert to base64 using chunks to avoid call stack size exceeded
    let binary = '';
    const chunkSize = 1024;
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.byteLength));
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    
    console.log(`Converted image to base64 [${requestId}]`);
    
    return btoa(binary);
  } catch (error) {
    console.error(`Error converting image to base64 [${requestId}]:`, error);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

// Generate comprehensive prompt emphasizing the need to identify ALL products
function generateComprehensivePrompt(requestId: string): string {
  console.log(`Generating comprehensive prompt for complete shelf analysis [${requestId}]`);
  
  return `You are a visual retail analysis assistant helping merchandizers assess shelf conditions from store photos.

Given an image of a shelf, extract structured merchandising data for EVERY SINGLE SKU that is visible, along with related metadata. You MUST be comprehensive and identify ALL products visible in the image, no matter how partially visible or obscured they may be. Do not skip any items. You MUST return the result in a JSON format wrapped in triple backtick markdown code blocks like this: \`\`\`json\n{your JSON here}\n\`\`\`.

Each SKU must also include an \`ImageID\` field referencing the image filename or identifier it came from, for traceability.

---

### 📑 Field Definitions (Section C: Extracted Attributes):

* **SKUFullName**: Full product name as written on the label (e.g., "Coca-Cola 500ml Bottle")
* **SKUBrand**: Brand only (e.g., "Coca-Cola")
* **ProductCategory1**: Set to null for now
* **ProductCategory2**: Set to null for now
* **ProductCategory3**: Set to null for now
* **PackSize**: The size or volume of the product, including both number and unit (e.g., "500ml", "200g"). Use \`null\` if not available
* **Flavor**: The flavor or variant if mentioned (e.g., "Lemon", "Vanilla"). Use \`null\` if not available
* **NumberFacings**: How many visible facings of this product are on the shelf (front-facing only)
* **PriceSKU**: Price of this SKU from the visible tag (e.g., "\$1.29"). Use \`null\` if not visible
* **ShelfSection**: Location within the shelf area (e.g., "Top Left", "Middle Right", etc.)
* **OutofStock**: \`true\` if a shelf tag for this SKU is present but no product is in that spot; otherwise \`false\`
* **Misplaced**: \`true\` if the visible product is **not behind its correct price/tag** (e.g., a different product is in its place)
* **BoundingBox**: The coordinates of one representative facing, in the form: \`{ "x": INT, "y": INT, "width": INT, "height": INT, "confidence": FLOAT }\`, where \`confidence\` ranges from 0 (no confidence) to 1 (full confidence) and reflects the reliability of the recognition. Use \`null\` if the SKU is only tagged, not visible.
* **Tags**: Any visible labels, signs, or indicators (e.g., "Discount", "Out of Stock", "2 for 1")

---

### 📤 **Output JSON Format (Section B: Example Output):**

\`\`\`json
{
  "SKUs": [
    {
      "SKUFullName": null,
      "SKUBrand": null,
      "ProductCategory1": null,
      "ProductCategory2": null,
      "ProductCategory3": null,
      "PackSize": null,
      "Flavor": null,
      "NumberFacings": null,
      "PriceSKU": null,
      "ShelfSection": null,
      "OutofStock": null,
      "Misplaced": null,
      "BoundingBox": null,
      "Tags": ["Unrecognized SKU"],
      "ImageID": "image_unrecognized.jpg"
    },
    {
      "SKUFullName": "Coca-Cola 500ml Bottle",
      "SKUBrand": "Coca-Cola",
      "ProductCategory1": null,
      "ProductCategory2": null,
      "ProductCategory3": null,
      "PackSize": "500ml",
      "Flavor": null,
      "NumberFacings": 4,
      "PriceSKU": "$1.29",
      "ShelfSection": "Middle Left",
      "OutofStock": false,
      "Misplaced": false,
      "BoundingBox": { "x": 120, "y": 340, "width": 80, "height": 200, "confidence": 0.95 },
      "Tags": ["Discount"],
      "ImageID": "image_001.jpg"
    },
    {
      "SKUFullName": "Pepsi 500ml Bottle",
      "SKUBrand": "Pepsi",
      "ProductCategory1": null,
      "ProductCategory2": null,
      "ProductCategory3": null,
      "PackSize": "500ml",
      "Flavor": null,
      "NumberFacings": 0,
      "PriceSKU": "$1.25",
      "ShelfSection": "Bottom Right",
      "OutofStock": true,
      "Misplaced": false,
      "BoundingBox": null,
      "Tags": ["Price Label Visible"],
      "ImageID": "image_002.jpg"
    }
  ]
}
\`\`\`

---

### 🖼️ **Image Processing Guidelines:**

* You MUST identify and analyze EVERY SINGLE product visible in the image.
* For partially visible products, attempt to identify them if enough of the packaging is visible.
* When products are stacked or overlapping, count as separate facings only if more than 50% of the front is visible.
* In crowded shelves, prioritize clear and unobstructed facings over partially visible ones, but still include all identifiable products.
* If products are arranged in multiple rows (depth), only count front-row items that are directly visible.

### 📌 **Important Guidelines (Section A: Output Rules):**

### 🧾 Field Standardization:

* **PriceSKU**: Always use format "\$X.XX" or "€X.XX" with two decimal places.
* **PackSize**: Use standardized units (ml, g, kg, oz) with no space between number and unit.
* **ShelfSection**: Use strictly "Top/Middle/Bottom" + "Left/Center/Right" combinations (e.g., "Top Left", "Middle Center").
* **PackSize and Flavor**: Extract these using text parsing and OCR from SKUFullName or visible labels. Do not infer beyond visible text.

IMPORTANT: Your response MUST be in valid JSON format wrapped in triple backtick markdown code blocks like this: \`\`\`json\n{your JSON here}\n\`\`\`.
IMPORTANT: You MUST identify and include ALL products visible in the image, no matter how small or partially visible.
`;
}

