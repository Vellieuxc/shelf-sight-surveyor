
import { ValidationError } from "./error-handler.ts";

// Enhanced input validation with security checks
export async function validateRequest(req: Request, requestId: string): Promise<{ imageUrl: string, imageId: string }> {
  const requestData = await req.json().catch(error => {
    console.error(`Failed to parse request body [${requestId}]:`, error);
    throw new ValidationError("Invalid request body format");
  });
  
  const { imageUrl, imageId } = requestData;
  
  // Validate imageUrl is present
  if (!imageUrl) {
    console.error(`Image URL is required but was not provided [${requestId}]`);
    throw new ValidationError("Image URL is required");
  }
  
  // Validate imageUrl is a string and has a reasonable length
  if (typeof imageUrl !== 'string' || imageUrl.length > 2048) {
    console.error(`Invalid image URL format or length [${requestId}]`);
    throw new ValidationError("Image URL must be a valid string less than 2048 characters");
  }
  
  // Validate the URL format (basic validation)
  try {
    new URL(imageUrl);
  } catch (e) {
    console.error(`Invalid URL format [${requestId}]:`, e);
    throw new ValidationError("Image URL must be a valid URL");
  }
  
  // Validate imageId if provided
  if (imageId && (typeof imageId !== 'string' || imageId.length > 100)) {
    console.error(`Invalid image ID format or length [${requestId}]`);
    throw new ValidationError("Image ID must be a valid string less than 100 characters");
  }
  
  // Sanitize inputs before returning
  const sanitizedImageUrl = encodeURI(decodeURI(imageUrl)); // Re-encode after decoding to normalize
  const sanitizedImageId = imageId ? imageId.replace(/[^a-zA-Z0-9_\-\.]/g, '') : 'unspecified';
  
  return { imageUrl: sanitizedImageUrl, imageId: sanitizedImageId };
}
