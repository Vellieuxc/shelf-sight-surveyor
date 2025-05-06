
/**
 * Parse and extract JSON from Claude API response
 * 
 * @param content The text content from Claude API response
 * @param requestId Unique identifier for request tracking
 * @returns Parsed JSON data
 */
export function parseClaudeResponse(content: string, requestId: string): any {
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
}
