
import { fetchAndConvertImageToBase64 } from "./utils/image-utils.ts";
import { generateComprehensivePrompt } from "./services/prompt-generator.ts";
import { callClaudeAPI } from "./services/claude-api.ts";
import { parseClaudeResponse } from "./utils/response-parser.ts";
import { withClaudeRetry } from "./retry.ts";
import { monitorClaudeCall } from "./monitoring.ts";

// Improved cache with TTL and size management
const analysisCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 100;

/**
 * Optimized edge function to analyze a shelf image using Claude
 * Enhanced with better caching, error handling and rate limit management
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
    
    // Manage cache size
    if (analysisCache.size >= MAX_CACHE_ENTRIES) {
      const oldestKey = analysisCache.keys().next().value;
      analysisCache.delete(oldestKey);
    }
    
    // Use retry mechanism for fetching and converting the image
    let base64Image;
    try {
      base64Image = await withClaudeRetry(
        () => fetchAndConvertImageToBase64(imageUrl, requestId),
        requestId,
        { maxRetries: 3, initialDelay: 1000 }
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
    
    // Call Claude API with retry capability
    let response;
    try {
      response = await monitorClaudeCall(() =>
        withClaudeRetry(
          () => callClaudeAPI(base64Image, prompt, requestId),
          requestId,
          { maxRetries: 3, initialDelay: 2000, maxDelay: 10000 }
        )
      );
    } catch (apiError) {
      // Enhanced error handling - Check for rate limit errors
      if (apiError.message && apiError.message.includes('rate_limit')) {
        console.error(`Claude API rate limit exceeded [${requestId}]. Using fallback response.`);
        return createFallbackResponse(requestId);
      }
      
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
    
    console.log(`Raw Claude response [${requestId}]:`, content.substring(0, 100) + '...');
    
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

/**
 * Create a fallback response when Claude API fails
 */
function createFallbackResponse(requestId: string): any {
  console.log(`Creating fallback response structure [${requestId}]`);
  return {
    metadata: {
      total_items: 0,
      out_of_stock_positions: 0,
      analysis_status: "failed",
      error_type: "api_unavailable"
    },
    shelves: [],
    _fallback: true
  };
}
