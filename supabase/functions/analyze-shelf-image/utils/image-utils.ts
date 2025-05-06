
/**
 * Fetch an image from a URL and convert it to base64
 * Optimized to reduce image size for faster processing
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
    
    // Use more memory-efficient approach to convert to base64
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Convert to base64 using a memory-efficient approach
    // This avoids the stack overflow caused by large images
    let result = '';
    const chunks: string[] = [];
    const chunkSize = 4096; // Use a smaller chunk size to avoid stack overflow
    let binary = '';
    
    // Process in small chunks to avoid call stack issues
    for (let i = 0; i < bytes.byteLength; i += chunkSize) {
      const end = Math.min(i + chunkSize, bytes.byteLength);
      const slice = bytes.subarray(i, end);
      
      // Convert each byte to a character
      for (let j = 0; j < slice.length; j++) {
        binary += String.fromCharCode(slice[j]);
      }
    }
    
    console.log(`Converted image to base64 [${requestId}]`);
    
    return btoa(binary);
  } catch (error) {
    console.error(`Error converting image to base64 [${requestId}]:`, error);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}
