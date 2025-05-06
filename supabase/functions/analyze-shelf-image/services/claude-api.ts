
import { corsHeaders } from "../cors.ts";

/**
 * Call the Claude API with the given prompt and image
 * 
 * @param base64Image Base64 encoded image data
 * @param prompt System prompt for Claude
 * @param requestId Unique identifier for request tracking
 * @returns Parsed JSON response from Claude
 */
export async function callClaudeAPI(base64Image: string, prompt: string, requestId: string): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  
  if (!ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  }
  
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
  
  return data;
}
