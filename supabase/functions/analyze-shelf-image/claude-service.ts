
import { fetchAndConvertImageToBase64 } from "./utils/image-utils.ts";
import { generateComprehensivePrompt } from "./services/prompt-generator.ts";
import { callClaudeAPI } from "./services/claude-api.ts";
import { parseClaudeResponse } from "./utils/response-parser.ts";
import { withClaudeRetry } from "./retry.ts";
import { monitorClaudeCall } from "./monitoring.ts";

// Improved cache with TTL and size management
const analysisCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_ENTRIES = 50;

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
      // Remove oldest entry
      const oldestKey = analysisCache.keys().next().value;
      analysisCache.delete(oldestKey);
    }
    
    // Fetch and convert image with error handling
    console.log(`Fetching image from URL: ${imageUrl} [${requestId}]`);
    let base64Image;
    
    try {
      base64Image = await withClaudeRetry(
        () => fetchAndConvertImageToBase64(imageUrl, requestId),
        requestId
      );
      console.log(`Successfully converted image to base64 [${requestId}]`);
    } catch (imgError) {
      console.error(`Failed to process image [${requestId}]:`, imgError);
      throw new Error(`Image processing failed: ${imgError.message}`);
    }
    
    // Generate prompt
    const prompt = generateComprehensivePrompt(requestId);
    
    // Call Claude API with monitoring and retry
    let response;
    try {
      response = await monitorClaudeCall(async () => {
        return await withClaudeRetry(
          () => callClaudeAPI(base64Image, prompt, requestId),
          requestId
        );
      });
    } catch (apiError) {
      console.error(`Claude API error [${requestId}]:`, apiError);
      throw new Error(`Claude API error: ${apiError.message}`);
    }
    
    if (!response || !response.content) {
      throw new Error(`Invalid response from Claude API [${requestId}]`);
    }
    
    // Extract the content
    const content = response.content[0]?.text;
    
    if (!content) {
      throw new Error(`Empty content from Claude API [${requestId}]`);
    }
    
    // Parse the response to extract JSON
    let parsedData;
    try {
      parsedData = await parseClaudeResponse(content, requestId);
    } catch (parseError) {
      console.error(`Failed to parse Claude response [${requestId}]:`, parseError);
      throw new Error(`Failed to parse Claude response: ${parseError.message}`);
    }
    
    // Cache the result
    analysisCache.set(cacheKey, {
      data: parsedData,
      timestamp: Date.now()
    });
    
    return parsedData;
    
  } catch (error) {
    console.error(`Error analyzing image with Claude [${requestId}]:`, error);
    
    // Return a valid structured response even on error
    return {
      metadata: {
        total_items: 0,
        out_of_stock_positions: 0,
        analysis_status: "error",
        error_message: error.message || "Unknown error"
      },
      shelves: []
    };
  }
}
