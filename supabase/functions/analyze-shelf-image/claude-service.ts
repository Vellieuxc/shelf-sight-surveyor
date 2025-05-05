
import { ExternalServiceError } from "./error-handler.ts";

// Maximum retries for external API calls
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Fetches an image from a URL and converts it to base64
 * With retry logic for resilience
 */
async function fetchAndConvertImageToBase64(imageUrl: string, requestId: string): Promise<string> {
  console.log(`Fetching image from URL: ${imageUrl.substring(0, 50)}... [${requestId}]`);
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      const imageBlob = await response.blob();
      const buffer = await imageBlob.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      return base64;
    } catch (error) {
      console.error(`Error fetching image (attempt ${attempt}/${MAX_RETRIES}): ${error.message}`);
      if (attempt === MAX_RETRIES) throw error;
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
  
  throw new Error('Failed to fetch image after maximum retries');
}

/**
 * Analyzes an image using Claude API
 * Fixed to avoid stack overflow issues
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
    const systemPrompt = `You are a retail shelf analysis expert. Analyze the provided image of store shelves and identify SKUs with the following information:
    1. Brand name
    2. Full product name
    3. Number of facings visible
    4. Price if visible
    5. Position on shelf (top, middle, bottom)
    6. Confidence level in identification
    
    Return the data as a JSON array of objects, one for each product, with these properties:
    - SKUBrand: string with brand name
    - SKUFullName: string with full product name
    - NumberFacings: number of facings
    - PriceSKU: string with price
    - ShelfSection: "top", "middle", or "bottom"
    - BoundingBox: object with confidence value

    Only identify distinct products. The output must be valid JSON with no other text.`;
    
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
      
      if (!Array.isArray(productsArray)) {
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
