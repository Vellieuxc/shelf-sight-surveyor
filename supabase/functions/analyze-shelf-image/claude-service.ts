
import { fetchAndConvertImageToBase64 } from "./utils/image-utils.ts";
import { generateComprehensivePrompt } from "./services/prompt-generator.ts";
import { callClaudeAPI } from "./services/claude-api.ts";
import { parseClaudeResponse } from "./utils/response-parser.ts";
import { withClaudeRetry } from "./retry.ts";

/**
 * Edge function to analyze a shelf image using Claude
 * 
 * @param imageUrl URL of the image to analyze
 * @param requestId Unique identifier for tracking
 * @returns Analysis data extracted from the image
 */
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any> {
  console.log(`Starting image analysis with Claude [${requestId}]`);
  console.log(`Fetching image from URL: ${imageUrl} [${requestId}]`);
  
  try {
    // Use retry mechanism for fetching and converting the image
    const base64Image = await withClaudeRetry(
      () => fetchAndConvertImageToBase64(imageUrl, requestId),
      requestId
    );
    
    console.log(`Successfully converted image to base64 [${requestId}]`);
    
    // Generate the comprehensive prompt
    const prompt = generateComprehensivePrompt(requestId);
    
    // Log payload estimation for debugging
    console.log(`Base64 image size: ${base64Image.length} characters [${requestId}]`);
    
    // Call Claude API with retry capability
    const response = await withClaudeRetry(
      () => callClaudeAPI(base64Image, prompt, requestId),
      requestId
    );
    
    // Extract the content from response
    const content = response.content[0].text;
    console.log(`Raw Claude response [${requestId}]:`, content);
    
    // Parse the response to extract JSON
    return parseClaudeResponse(content, requestId);
    
  } catch (error) {
    console.error(`Error analyzing image with Claude [${requestId}]:`, error);
    throw error;
  }
}
