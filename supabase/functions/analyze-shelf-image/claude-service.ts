
import { ExternalServiceError } from "./error-handler.ts";

// Maximum retries for external API calls
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Fetches an image from a URL and converts it to base64
 * Optimized to avoid stack overflow with large images
 */
async function fetchAndConvertImageToBase64(imageUrl: string, requestId: string): Promise<string> {
  console.log(`Fetching image from URL: ${imageUrl.substring(0, 50)}... [${requestId}]`);
  
  // Iterative implementation for retries
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Perform the fetch operation
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      // Process the image data with a chunked approach to avoid stack overflow
      const imageBlob = await response.blob();
      const buffer = await imageBlob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      // Process large arrays in chunks to avoid call stack limits
      let binary = '';
      const chunkSize = 1024; // Process 1KB chunks
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.slice(i, i + chunkSize);
        for (let j = 0; j < chunk.length; j++) {
          binary += String.fromCharCode(chunk[j]);
        }
      }
      
      // Now convert the binary string to base64
      const base64 = btoa(binary);
      
      return base64;
    } catch (error) {
      console.error(`Error fetching image (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
      
      // If this is the last attempt, throw the error
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  
  // This line should never be reached due to the throw in the loop,
  // but it's here to satisfy TypeScript's control flow analysis
  throw new Error('Failed to fetch image after maximum retries');
}

/**
 * Analyzes an image using Claude API
 */
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any[]> {
  try {
    console.log(`🤖 Starting Claude analysis for image [${requestId}]`);
    
    // Convert image to base64
    console.log(`Converting image to base64 [${requestId}]`);
    const base64Image = await fetchAndConvertImageToBase64(imageUrl, requestId);
    
    // API key from environment
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable");
    }
    
    // Claude API endpoint
    const apiUrl = "https://api.anthropic.com/v1/messages";
    
    // Define the system prompt for retail shelf analysis
    const systemPrompt = `🧠 Claude Prompt — Shelf Image Analysis with Integrated Metadata and Confidence Scoring

You are a visual retail analysis assistant helping merchandizers assess shelf conditions from store photos.

Given an image of a shelf, extract structured merchandising data for each SKU, along with related metadata. Return the result in a JSON format. Each SKU must also include an \`ImageID\` field referencing the image filename or identifier it came from, for traceability.

---

### 📑 Field Definitions (Section C: Extracted Attributes):

* **SKUFullName**: Full product name as written on the label (e.g., "Coca-Cola 500ml Bottle")
* **SKUBrand**: Brand only (e.g., "Coca-Cola")
* **ProductCategory1**: Main product category, chosen based on the predefined list below
* **ProductCategory2**: Subcategory, also chosen based on the predefined list
* **ProductCategory3**: Subcategory, also chosen based on the predefined list
* **PackSize**: The size or volume of the product, including both number and unit (e.g., "500ml", "200g"). Use \`null\` if not available
* **Flavor**: The flavor or variant if mentioned (e.g., "Lemon", "Vanilla"). Use \`null\` if not available
* **NumberFacings**: How many visible facings of this product are on the shelf (front-facing only)
* **PriceSKU**: Price of this SKU from the visible tag (e.g., "$1.29"). Use \`null\` if not visible
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
      "ProductCategory1": "Drinks",
      "ProductCategory2": "Soft Drinks",
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
      "ProductCategory1": "Drinks",
      "ProductCategory2": "Soft Drinks",
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
    },
    {
      "SKUFullName": "Sprite 500ml Bottle",
      "SKUBrand": "Sprite",
      "ProductCategory1": "Drinks",
      "ProductCategory2": "Soft Drinks",
      "ProductCategory3": null,
      "PackSize": "500ml",
      "Flavor": null,
      "NumberFacings": 2,
      "PriceSKU": "$1.20",
      "ShelfSection": "Middle Center",
      "OutofStock": false,
      "Misplaced": true,
      "BoundingBox": { "x": 310, "y": 370, "width": 85, "height": 190, "confidence": 0.88 },
      "Tags": [],
      "ImageID": "image_003.jpg"
    }
  ]
}
\`\`\`

---

### 🖼️ **Image Processing Guidelines:**

* When products are stacked or overlapping, count as separate facings only if more than 50% of the front is visible.
* In crowded shelves, prioritize clear and unobstructed facings over partially visible ones.
* If products are arranged in multiple rows (depth), only count front-row items that are directly visible.

### 📌 **Important Guidelines (Section A: Output Rules):**

### 🧾 Field Standardization:

* **PriceSKU**: Always use format "$X.XX" or "€X.XX" with two decimal places.
* **PackSize**: Use standardized units (ml, g, kg, oz) with no space between number and unit.
* **ShelfSection**: Use strictly "Top/Middle/Bottom" + "Left/Center/Right" combinations (e.g., "Top Left", "Middle Center").
* **PackSize and Flavor**: Extract these using text parsing and OCR from SKUFullName or visible labels. Do not infer beyond visible text.
* **Category Fields**: The fields \`ProductCategory1\`, \`ProductCategory2\`, and \`ProductCategory3\` must match the industry taxonomy categories. If no match exists, set them to \`null\` and tag the SKU as \`Unmatched SKU\`.`;
    
    // Build the message content with image
    const messages = [
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
            text: "Analyze this retail shelf image and identify all products. Return ONLY valid JSON array."
          }
        ]
      }
    ];
    
    // Make the API request
    console.log(`Sending request to Claude API [${requestId}]`);
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: systemPrompt,
        messages: messages
      })
    });
    
    // Handle API response
    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Claude API error [${requestId}]: ${response.status} - ${errorBody}`);
      throw new ExternalServiceError(`Claude API returned error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and parse the JSON response
    // The content should be a JSON array as requested in our prompt
    let productsArray: any[] = [];
    
    try {
      const textContent = data.content[0].text;
      
      // Extract JSON array from the response (it might be surrounded by markdown code blocks)
      const jsonMatch = textContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                       textContent.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, textContent];
                       
      const jsonContent = jsonMatch[1] || textContent;
      productsArray = JSON.parse(jsonContent);
      
      if (!Array.isArray(productsArray) && productsArray.SKUs && Array.isArray(productsArray.SKUs)) {
        // If we get the {SKUs: []} format from the new prompt
        productsArray = productsArray.SKUs;
      } else if (!Array.isArray(productsArray)) {
        throw new Error("Claude did not return an array of products");
      }
      
      console.log(`Parsed ${productsArray.length} products from Claude response [${requestId}]`);
    } catch (error) {
      console.error(`Error parsing Claude response [${requestId}]:`, error);
      throw new Error(`Failed to parse Claude response: ${error.message}`);
    }
    
    return productsArray;
    
  } catch (error) {
    console.error(`Error in analyzeImageWithClaude [${requestId}]:`, error);
    throw error;
  }
}
