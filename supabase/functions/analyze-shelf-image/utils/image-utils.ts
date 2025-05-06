
/**
 * Optimized utilities for image processing in edge functions
 * Refactored for better memory efficiency and performance
 */

/**
 * Fetch an image from a URL and convert it to base64
 * Memory-efficient implementation to handle large images without stack overflow
 * 
 * @param imageUrl URL of the image to fetch
 * @param requestId Unique identifier for request tracking
 * @returns Base64 encoded image data
 */
export async function fetchAndConvertImageToBase64(imageUrl: string, requestId: string): Promise<string> {
  try {
    console.log(`Fetching image with URL: ${imageUrl} [${requestId}]`);
    
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`Image fetched successfully, size: ${blob.size} bytes [${requestId}]`);
    
    // Check if the image size is too large
    if (blob.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error(`Image too large: ${(blob.size / (1024 * 1024)).toFixed(2)}MB (max 10MB)`);
    }
    
    // Use array buffer for more efficient conversion
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Convert to base64 using a more memory-efficient chunked approach
    let base64 = '';
    const chunkSize = 8192; // Use smaller chunks to avoid call stack issues (8KB)
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      base64 += binaryToBase64Chunk(chunk);
      
      // Add a small delay every few chunks to avoid stack overflow on very large images
      if (i > 0 && i % (chunkSize * 32) === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
    
    // Check for valid base64 data
    if (!isValidBase64(base64)) {
      console.error(`Generated invalid base64 data [${requestId}]`);
      throw new Error("Generated invalid base64 data");
    }
    
    console.log(`Successfully converted image to base64 [${requestId}]`);
    return base64;
  } catch (error) {
    console.error(`Error converting image to base64 [${requestId}]:`, error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Helper function to convert binary data to base64 without stack overflow
 * Optimized for smaller chunks of data
 */
function binaryToBase64Chunk(bytes: Uint8Array): string {
  // Process in even smaller sub-chunks if needed
  if (bytes.length > 4096) {
    let result = '';
    const subChunkSize = 4096;
    for (let i = 0; i < bytes.length; i += subChunkSize) {
      const subChunk = bytes.subarray(i, Math.min(i + subChunkSize, bytes.length));
      result += binaryToBase64Chunk(subChunk);
    }
    return result;
  }
  
  try {
    // Convert using standard Deno APIs with better performance
    let binString = '';
    
    // Process byte-by-byte instead of using String.fromCharCode.apply
    // This avoids call stack size exceeded errors
    for (let i = 0; i < bytes.length; i++) {
      binString += String.fromCharCode(bytes[i]);
    }
    
    return btoa(binString);
  } catch (error) {
    console.error("Base64 conversion error:", error);
    throw new Error("Base64 conversion failed");
  }
}

/**
 * Validate that the string is proper base64 data
 */
function isValidBase64(str: string): boolean {
  // Basic validation - check the string isn't empty and has valid characters
  if (!str || str.length === 0) return false;
  
  // Check that the string only contains valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  return base64Regex.test(str);
}
