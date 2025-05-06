
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
    const chunkSize = 32768; // Process in chunks to avoid call stack issues
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
      base64 += binaryToBase64(chunk);
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
 */
function binaryToBase64(bytes: Uint8Array): string {
  const binString = Array.from(bytes)
    .map(byte => String.fromCharCode(byte))
    .join('');
  return btoa(binString);
}
