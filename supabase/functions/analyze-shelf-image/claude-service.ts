
import { fetchAndConvertImageToBase64 } from "./utils/image-utils.ts";
import { generateComprehensivePrompt } from "./services/prompt-generator.ts";
import { callClaudeAPI } from "./services/claude-api.ts";
import { parseClaudeResponse } from "./utils/response-parser.ts";
import { withClaudeRetry } from "./retry.ts";
import { monitorClaudeCall } from "./monitoring.ts";

// Cache to store recent analysis results to avoid redundant processing
const analysisCache = new Map();
// Cache TTL in milliseconds (15 minutes)
const CACHE_TTL = 15 * 60 * 1000;

/**
 * Edge function to analyze a shelf image using Claude
 * Optimized for performance with caching and improved error handling
 * 
 * @param imageUrl URL of the image to analyze
 * @param requestId Unique identifier for tracking
 * @returns Analysis data extracted from the image
 */
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any> {
  console.log(`Starting image analysis with Claude [${requestId}]`);
  console.log(`Fetching image from URL: ${imageUrl} [${requestId}]`);
  
  try {
    // Check cache first - use URL as cache key
    const cacheKey = `${imageUrl}`;
    if (analysisCache.has(cacheKey)) {
      const { data, timestamp } = analysisCache.get(cacheKey);
      
      // If cache entry is still valid
      if (Date.now() - timestamp < CACHE_TTL) {
        console.log(`Using cached analysis result for [${requestId}]`);
        return data;
      } else {
        // Remove expired cache entry
        analysisCache.delete(cacheKey);
      }
    }
    
    // Use retry mechanism for fetching and converting the image
    let base64Image;
    try {
      base64Image = await monitorClaudeCall(() => 
        withClaudeRetry(
          () => fetchAndConvertImageToBase64(imageUrl, requestId),
          requestId
        )
      );
      
      console.log(`Successfully converted image to base64 [${requestId}]`);
    } catch (imgError) {
      console.error(`Failed to process image [${requestId}]:`, imgError);
      throw new Error(`Image processing failed: ${imgError.message}`);
    }
    
    // Generate the comprehensive prompt
    const prompt = generateComprehensivePrompt(requestId);
    
    // Log payload estimation for debugging
    console.log(`Base64 image size: ${base64Image.length} characters [${requestId}]`);
    
    // Call Claude API with retry capability and performance monitoring
    let response;
    try {
      response = await monitorClaudeCall(() =>
        withClaudeRetry(
          () => callClaudeAPI(base64Image, prompt, requestId),
          requestId
        )
      );
    } catch (apiError) {
      console.error(`Claude API error [${requestId}]:`, apiError);
      throw new Error(`Claude API error: ${apiError.message}`);
    }
    
    if (!response || !response.content) {
      throw new Error(`Invalid response from Claude API [${requestId}]`);
    }
    
    // Extract the content from response
    const content = response.content[0]?.text;
    
    if (!content) {
      throw new Error(`Empty content from Claude API [${requestId}]`);
    }
    
    console.log(`Raw Claude response [${requestId}]:`, content);
    
    // Parse the response to extract JSON
    let parsedData;
    try {
      parsedData = await parseClaudeResponse(content, requestId);
    } catch (parseError) {
      console.error(`Failed to parse Claude response [${requestId}]:`, parseError);
      throw new Error(`Failed to parse Claude response: ${parseError.message}`);
    }
    
    // Store in cache
    analysisCache.set(cacheKey, {
      data: parsedData,
      timestamp: Date.now()
    });
    
    return parsedData;
    
  } catch (error) {
    console.error(`Error analyzing image with Claude [${requestId}]:`, error);
    throw error;
  }
}
