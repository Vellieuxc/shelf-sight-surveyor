
import { corsHeaders } from "./cors.ts";
import { Anthropic } from "npm:@anthropic-ai/sdk@0.12.0";

// Get Claude's interpretation of a shelf image
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any[]> {
  try {
    console.log(`🤖 Starting Claude analysis for image [${requestId}]`);
    
    // Get the API key from environment variables
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      console.error(`Missing ANTHROPIC_API_KEY environment variable [${requestId}]`);
      throw new Error("Missing ANTHROPIC_API_KEY environment variable");
    }
    
    // Initialize the Anthropic client
    const anthropic = new Anthropic({
      apiKey: anthropicApiKey,
    });
    
    // Fetch the image
    console.log(`Fetching image from URL: ${imageUrl.substring(0, 50)}... [${requestId}]`);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "ShelfAnalysis/1.0",
      },
    });
    
    if (!imageResponse.ok) {
      console.error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText} [${requestId}]`);
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Convert image to base64
    console.log(`Converting image to base64 [${requestId}]`);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Call the Anthropic API using the SDK
    console.log(`Sending request to Claude API with prompt [${requestId}]`);
    const message = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Analyze this shelf image and identify all products visible. 
              
For each product provide:
1. Brand name
2. Product name/type
3. Package size/volume (if visible)
4. Position on shelf (top, middle, bottom)
5. Visibility score (1-10, where 10 is most visible)
6. Color of packaging (primary colors)

Return your analysis as valid JSON array only, with each product as an object. Do not include any explanatory text, ONLY the JSON array.

Example format:
[
  {
    "brand": "Brand Name",
    "product": "Product Type",
    "package_size": "Size or Volume",
    "position": "top|middle|bottom",
    "visibility": 8,
    "color": "Main colors"
  },
  ...
]`,
            },
          ],
        },
      ],
      system: "You are a retail shelf analysis expert that identifies products on store shelves. Only respond with valid JSON."
    });

    // Extract the content from Claude's response
    const responseText = message.content[0]?.text || "";
    console.log(`Claude raw response received [${requestId}]. Length: ${responseText.length} chars`);

    // Extract JSON from response (Claude sometimes wraps it in markdown code blocks)
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                    responseText.match(/```\s*([\s\S]*?)\s*```/) || 
                    [null, responseText];
    
    let jsonText = jsonMatch[1] || responseText;
    
    // Clean up any remaining text before or after the JSON
    jsonText = jsonText.trim();
    
    // Parse the JSON response
    try {
      console.log(`Parsing JSON response [${requestId}]`);
      const analysisData = JSON.parse(jsonText);
      
      // Validate that we got an array of products
      if (!Array.isArray(analysisData)) {
        console.error(`Response is not an array [${requestId}]`);
        throw new Error("Response is not an array");
      }
      
      console.log(`Successfully parsed JSON response with ${analysisData.length} products [${requestId}]`);
      return analysisData;
    } catch (parseError) {
      console.error(`Error parsing JSON response [${requestId}]:`, parseError);
      console.error(`JSON text sample [${requestId}]:`, jsonText.substring(0, 200));
      throw new Error(`Failed to parse Claude's response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error in analyzeImageWithClaude [${requestId}]:`, error);
    throw error;
  }
}
