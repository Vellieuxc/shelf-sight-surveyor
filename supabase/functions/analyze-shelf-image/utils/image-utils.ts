
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
    
    // Read blob as base64 directly - a more reliable approach
    try {
      // Use array buffer approach
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const base64 = encodeBase64(uint8Array);
      
      console.log(`Successfully converted image to base64, length: ${base64.length} [${requestId}]`);
      
      return base64;
    } catch (encodingError) {
      console.error(`Error encoding image to base64 [${requestId}]:`, encodingError);
      throw new Error(`Failed to encode image: ${encodingError.message}`);
    }
  } catch (error) {
    console.error(`Error converting image to base64 [${requestId}]:`, error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Reliable base64 encoding for Deno using built-in TextEncoder and btoa
 */
function encodeBase64(bytes: Uint8Array): string {
  // For small input, use standard approach
  if (bytes.length < 10000) {
    return encodeSmallChunk(bytes);
  }
  
  // For larger inputs, use chunked approach
  let result = '';
  const chunkSize = 3000; // Process ~4KB chunks at a time to avoid stack issues
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    result += encodeSmallChunk(chunk);
  }
  
  return result;
}

/**
 * Encode a small chunk of data to base64
 */
function encodeSmallChunk(bytes: Uint8Array): string {
  // Ensure we're working with a buffer with valid bytes
  if (bytes.length === 0) return '';
  
  try {
    // Use standard base64 encoding by converting to binary string first
    const binary = Array.from(bytes)
      .map(byte => String.fromCharCode(byte))
      .join('');
      
    return btoa(binary);
  } catch (error) {
    throw new Error(`Base64 encoding error: ${error.message}`);
  }
}

/**
 * Validate that the string is proper base64 data
 * Enhanced to catch more edge cases
 */
function isValidBase64(str: string): boolean {
  // Basic validation - check if string is empty
  if (!str || str.length === 0) return false;
  
  // Check that the string only contains valid base64 characters
  const base64Regex = /^[A-Za-z0-9+/=]+$/;
  if (!base64Regex.test(str)) return false;
  
  // Check padding - base64 strings should be properly padded
  if (str.length % 4 !== 0) return false;
  
  // Check padding characters are only at the end
  const paddingMatch = str.match(/=+$/);
  if (paddingMatch) {
    const paddingLength = paddingMatch[0].length;
    if (paddingLength > 2) return false; // Max padding is 2 characters
  }
  
  return true;
}
