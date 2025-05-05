import { ExternalServiceError } from "./error-handler.ts";

/**
 * Analyzes an image with Claude API and returns structured data
 * @param imageUrl URL of the image to analyze
 * @param requestId Unique identifier for the request for tracing
 * @returns Analyzed data from the image
 */
export async function analyzeImageWithClaude(imageUrl: string, requestId: string) {
  console.log(`Starting Claude analysis for request [${requestId}]`);
  
  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("Missing Anthropic API key");
    }

    const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
    
    // Prepare the prompt for Claude
    const systemPrompt = `You are a retail shelf analysis assistant. Analyze the image of retail shelves and identify all products visible.
For each product (SKU) visible on the shelf, extract the following information:
1. SKUFullName: The complete product name
2. SKUBrand: The brand name
3. NumberFacings: How many facings (units side by side) of this product are visible
4. PriceSKU: The price if visible (include currency symbol)
5. ShelfSection: Position on shelf (top, middle, bottom, etc.)
6. OutofStock: Boolean indicating if there's an empty space where product should be
7. BoundingBox: Object with confidence score between 0-1

Return the data as a JSON array of objects, with each object representing one product. Be comprehensive and include all visible products.`;

    // Prepare the request to Claude API
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Please analyze this retail shelf image and provide detailed information about all products visible."
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Claude API error [${requestId}]:`, errorData);
      throw new Error(`Claude API returned error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Claude analysis completed for request [${requestId}]`);

    // Extract the JSON from Claude's response
    const responseContent = data.content[0].text;
    
    // Find JSON in the response (between triple backticks or standalone)
    const jsonMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                      responseContent.match(/```\s*([\s\S]*?)\s*```/) ||
                      responseContent.match(/(\[[\s\S]*\])/);
                      
    if (!jsonMatch) {
      console.error(`Failed to extract JSON from Claude response [${requestId}]`);
      throw new Error("Could not extract structured data from Claude response");
    }
    
    // Parse the extracted JSON
    const jsonString = jsonMatch[1].trim();
    const analysisData = JSON.parse(jsonString);
    
    return analysisData;
  } catch (error) {
    console.error(`Claude analysis failed for request [${requestId}]:`, error);
    throw new ExternalServiceError(`Failed to analyze image with Claude: ${error.message}`);
  }
}
