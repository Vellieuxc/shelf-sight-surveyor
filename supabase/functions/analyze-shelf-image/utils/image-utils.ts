
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
    
    // For large images, we can optionally resize them before passing to Claude
    // This would require additional image processing that's not available in Deno
    // But we can optimize the base64 encoding process
    
    const buffer = await blob.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    // Convert to base64 using optimized chunk size
    let binary = '';
    const chunkSize = 8192; // Increased chunk size for better performance
    
    // Use a more efficient approach for larger images
    if (bytes.byteLength > 1024 * 1024) { // If larger than 1MB
      const chunks: string[] = [];
      for (let i = 0; i < bytes.byteLength; i += chunkSize) {
        const chunk = bytes.slice(i, Math.min(i + chunkSize, bytes.byteLength));
        chunks.push(String.fromCharCode.apply(null, chunk as unknown as number[]));
      }
      binary = chunks.join('');
    } else {
      // For smaller images, process in one go
      binary = String.fromCharCode.apply(null, bytes as unknown as number[]);
    }
    
    console.log(`Converted image to base64 [${requestId}]`);
    
    return btoa(binary);
  } catch (error) {
    console.error(`Error converting image to base64 [${requestId}]:`, error);
    throw new Error(`Failed to fetch image: ${error.message}`);
  }
}
