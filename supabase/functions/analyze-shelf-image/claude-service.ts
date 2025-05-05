
import { corsHeaders } from "./cors.ts";

// Anthropic Claude API types
interface ClaudeRequest {
  model: string;
  messages: Message[];
  max_tokens: number;
  system?: string;
}

interface Message {
  role: "user" | "assistant";
  content: MessageContent[];
}

interface MessageContent {
  type: "text" | "image";
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
  text?: string;
}

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: any[];
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

// Get Claude's interpretation of a shelf image
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any[]> {
  try {
    console.log(`🤖 Calling Claude for image analysis [${requestId}]`);
    
    // Get the API key from environment variables
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable");
    }
    
    // Fetch the image
    console.log(`Fetching image from URL: ${imageUrl} [${requestId}]`);
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "User-Agent": "ShelfAnalysis/1.0",
      },
    });
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.status} ${imageResponse.statusText}`);
    }
    
    // Convert image to base64
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(
      String.fromCharCode(...new Uint8Array(imageBuffer))
    );
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";
    
    // Construct the Claude API payload
    const payload: ClaudeRequest = {
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
    };

    // Call the Anthropic Claude API
    console.log(`Sending request to Claude API [${requestId}]`);
    const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(payload),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      console.error(`Claude API error [${requestId}]:`, errorBody);
      throw new Error(`Claude API returned ${claudeResponse.status}: ${errorBody}`);
    }

    // Parse the response
    const data: ClaudeResponse = await claudeResponse.json();
    console.log(`Claude API response received [${requestId}]`);

    // Extract the content from Claude's response
    const responseText = data.content[0]?.text || "";
    console.log(`Claude raw response [${requestId}]:`, responseText);

    // Extract JSON from response (Claude sometimes wraps it in markdown code blocks)
    let jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                    responseText.match(/```\s*([\s\S]*?)\s*```/) || 
                    [null, responseText];
    
    let jsonText = jsonMatch[1] || responseText;
    
    // Clean up any remaining text before or after the JSON
    jsonText = jsonText.trim();
    
    // Parse the JSON response
    try {
      const analysisData = JSON.parse(jsonText);
      
      // Validate that we got an array of products
      if (!Array.isArray(analysisData)) {
        throw new Error("Response is not an array");
      }
      
      console.log(`Successfully parsed JSON response with ${analysisData.length} products [${requestId}]`);
      return analysisData;
    } catch (parseError) {
      console.error(`Error parsing JSON response [${requestId}]:`, parseError);
      throw new Error(`Failed to parse Claude's response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`Error in analyzeImageWithClaude [${requestId}]:`, error);
    throw error;
  }
}
