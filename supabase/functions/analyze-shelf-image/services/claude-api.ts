
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
  
  // Validate base64 data before sending to Claude
  if (!base64Image || typeof base64Image !== 'string') {
    throw new Error("Invalid base64 image data: image data is empty or not a string");
  }
  
  // Check if the base64 data appears valid
  if (!isValidBase64(base64Image)) {
    console.error(`Invalid base64 image data detected [${requestId}]`);
    throw new Error("Invalid base64 image data format");
  }
  
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

/**
 * Validates if the string appears to be valid base64 data
 * 
 * @param str The string to validate
 * @returns boolean indicating if the string appears to be valid base64
 */
function isValidBase64(str: string): boolean {
  // Basic validation - check if string is empty
  if (!str || str.length === 0) {
    return false;
  }
  
  // Check string length - base64 strings should be a multiple of 4
  if (str.length % 4 !== 0) {
    console.warn("Base64 string length is not a multiple of 4");
    // We'll still continue as some valid base64 can be padded
  }
  
  // Check that the string only contains valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(str)) {
    return false;
  }
  
  // Check for reasonable length - extremely long strings might indicate an issue
  // Claude has a 5MB limit for images
  if (str.length > 5 * 1024 * 1024) {
    console.warn("Base64 string exceeds 5MB, which is Claude's limit");
    return false;
  }
  
  return true;
}
