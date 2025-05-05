
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
    
    // Load the TaxonomyIndustries.json file
    const taxonomyIndustries = await loadTaxonomyIndustries(requestId);
    
    // Prepare the Claude API request with the updated prompt
    const prompt = generateAnalysisPrompt(taxonomyIndustries, requestId);
    
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
                text: "Analyze this shelf image and provide detailed information about all visible products according to the format specified. Include the correct ProductCategory values from the taxonomy provided."
              }
            ]
          }
        ]
      })
    });
    
    if (!response.ok) {
      console.error(`Claude API error [${requestId}]: ${response.status} ${response.statusText}`);
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
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Convert to base64 using chunks to avoid call stack size exceeded
    let binary = '';
    const chunkSize = 1024;
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
      const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.byteLength));
      binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
    }
    
    return btoa(binary);
  } catch (error) {
    console.error(`Error converting image to base64 [${requestId}]:`, error);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}

// Load the taxonomy industries JSON file
async function loadTaxonomyIndustries(requestId: string): Promise<any[]> {
  try {
    // Update the path to use the data subfolder
    const taxonomyData = await Deno.readTextFile("./data/TaxonomyIndustries.json");
    console.log(`Successfully loaded TaxonomyIndustries.json [${requestId}]`);
    return JSON.parse(taxonomyData);
  } catch (error) {
    console.error(`Error loading TaxonomyIndustries.json [${requestId}]:`, error);
    console.log(`Falling back to minimal taxonomy [${requestId}]`);
    // Return a minimal taxonomy to avoid failing completely
    return [
      {
        "ProductCategory1": "Soft Drinks",
        "ProductCategory2": "Carbonates",
        "ProductCategory3": "Cola"
      },
      {
        "ProductCategory1": "Soft Drinks",
        "ProductCategory2": "Carbonates",
        "ProductCategory3": "Lemon-Lime"
      }
    ];
  }
}

// Generate analysis prompt with the taxonomy data
function generateAnalysisPrompt(taxonomyIndustries: any[], requestId: string): string {
  console.log(`Generating analysis prompt with taxonomy data [${requestId}]`);
  
  const taxonomyJson = JSON.stringify(taxonomyIndustries, null, 2);
  
  return `You are a visual retail analysis assistant helping merchandizers assess shelf conditions from store photos.

Given an image of a shelf, extract structured merchandising data for each SKU, along with related metadata. You MUST return the result in a JSON format wrapped in triple backtick markdown code blocks like this: \`\`\`json\n{your JSON here}\n\`\`\`.

Each SKU must also include an \`ImageID\` field referencing the image filename or identifier it came from, for traceability.

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
      "ProductCategory1": "Soft Drinks",
      "ProductCategory2": "Carbonates",
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
      "ProductCategory1": "Soft Drinks",
      "ProductCategory2": "Carbonates",
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
      "ProductCategory1": "Soft Drinks",
      "ProductCategory2": "Carbonates",
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

* **PriceSKU**: Always use format "\$X.XX" or "€X.XX" with two decimal places.
* **PackSize**: Use standardized units (ml, g, kg, oz) with no space between number and unit.
* **ShelfSection**: Use strictly "Top/Middle/Bottom" + "Left/Center/Right" combinations (e.g., "Top Left", "Middle Center").
* **PackSize and Flavor**: Extract these using text parsing and OCR from SKUFullName or visible labels. Do not infer beyond visible text.
* **Category Fields**: The fields \`ProductCategory1\`, \`ProductCategory2\`, and \`ProductCategory3\` must match an entry in the taxonomy data provided below. If no match exists, set them to \`null\` and tag the SKU as \`Unmatched SKU\`.

### Taxonomy Data:
${taxonomyJson}

IMPORTANT: Your response MUST be in valid JSON format wrapped in triple backtick markdown code blocks like this: \`\`\`json\n{your JSON here}\n\`\`\`.
`;
}

