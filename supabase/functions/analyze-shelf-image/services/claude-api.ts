
import { corsHeaders } from "../cors.ts";

/**
 * Call the Claude API with the given prompt and image
 * Enhanced with better error handling, timeout management, and request optimization
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

  // First level of validation - check if we have any data
  if (!base64Image || typeof base64Image !== 'string') {
    console.error(`Empty or non-string base64 data provided [${requestId}]`);
    throw new Error("Invalid base64 image data: image data is empty or not a string");
  }
  
  // Sample validation - check first few and last few characters
  const firstChars = base64Image.substring(0, 20);
  const lastChars = base64Image.substring(base64Image.length - 20);
  console.log(`Base64 validation check - first 20 chars: ${firstChars}, last 20 chars: ${lastChars} [${requestId}]`);
  
  // Check for strict Claude requirements for base64
  // Only include standard Base64 characters and padding
  const strictBase64Regex = /^[A-Za-z0-9+/]+=*$/;
  if (!strictBase64Regex.test(base64Image)) {
    console.error(`Base64 data contains invalid characters [${requestId}]`);
    throw new Error("Base64 data contains invalid characters");
  }
  
  // Check if string length is divisible by 4 (required for valid base64)
  if (base64Image.length % 4 !== 0) {
    console.error(`Base64 data length not divisible by 4: ${base64Image.length} [${requestId}]`);
    throw new Error("Base64 data has invalid length (must be multiple of 4)");
  }
  
  // Log base64 image length for debugging
  console.log(`Calling Claude API with base64 image length: ${base64Image.length} [${requestId}]`);
  console.log(`Calling Claude API with model: claude-3-opus-20240229 [${requestId}]`);
  
  try {
    // Use AbortController to handle timeouts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout
    
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
      }),
      signal: controller.signal
    });
    
    // Clear the timeout since the request completed
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Claude API error [${requestId}]: ${response.status} ${response.statusText}`);
      
      // Enhanced error reporting with rate limit handling
      const errorBody = await response.text();
      console.error(`Claude API error details [${requestId}]:`, errorBody);
      
      // Special handling for rate limit errors
      if (response.status === 429) {
        console.log(`[${requestId}] Claude API rate limit exceeded. Will retry after delay.`);
      }
      
      throw new Error(`Claude API returned error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received response from Claude API [${requestId}]`);
    
    return data;
  } catch (error) {
    // Better error handling for aborted requests
    if (error.name === 'AbortError') {
      console.error(`Claude API request timed out [${requestId}]`);
      throw new Error('Claude API request timed out after 2 minutes');
    }
    
    throw error;
  }
}
