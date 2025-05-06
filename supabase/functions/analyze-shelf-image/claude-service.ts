
import { fetchAndConvertImageToBase64 } from "./utils/image-utils.ts";
import { generateComprehensivePrompt } from "./services/prompt-generator.ts";
import { callClaudeAPI } from "./services/claude-api.ts";
import { parseClaudeResponse } from "./utils/response-parser.ts";
import { withClaudeRetry } from "./retry.ts";
import { monitorClaudeCall } from "./monitoring.ts";

// Cache to store recent analysis results to avoid redundant processing
const analysisCache = new Map();
// Cache TTL in milliseconds (30 minutes)
const CACHE_TTL = 30 * 60 * 1000;

/**
 * Edge function to analyze a shelf image using Claude
 * Optimized for performance with caching
 * 
 * @param imageUrl URL of the image to analyze
 * @param requestId Unique identifier for tracking
 * @returns Analysis data extracted from the image
 */
export async function analyzeImageWithClaude(imageUrl: string, requestId: string): Promise<any> {
  console.log(`Starting image analysis with Claude [${requestId}]`);
  console.log(`Fetching image from URL: ${imageUrl} [${requestId}]`);
  
  try {
    // Check cache first
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
    const base64Image = await monitorClaudeCall(() => 
      withClaudeRetry(
        () => fetchAndConvertImageToBase64(imageUrl, requestId),
        requestId
      )
    );
    
    console.log(`Successfully converted image to base64 [${requestId}]`);
    
    // Generate the comprehensive prompt
    const prompt = generateComprehensivePrompt(requestId);
    
    // Log payload estimation for debugging
    console.log(`Base64 image size: ${base64Image.length} characters [${requestId}]`);
    
    // Call Claude API with retry capability and performance monitoring
    const response = await monitorClaudeCall(() =>
      withClaudeRetry(
        () => callClaudeAPI(base64Image, prompt, requestId),
        requestId
      )
    );
    
    // Extract the content from response
    const content = response.content[0].text;
    console.log(`Raw Claude response [${requestId}]:`, content);
    
    // Parse the response to extract JSON
    const parsedData = await parseClaudeResponse(content, requestId);
    
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
