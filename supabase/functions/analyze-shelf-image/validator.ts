
import { ValidationError } from "./error-handler.ts";

// In-memory request counter for basic rate limiting
// Note: This is per instance. For production, use Redis or similar
const requestCounter: Record<string, { count: number, timestamp: number }> = {};

// Rate limit configuration
const RATE_LIMIT = 10; // requests per window
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute window

// Enhanced input validation with security checks and rate limiting
export async function validateRequest(req: Request, requestId: string): Promise<{ imageUrl: string, imageId: string }> {
  // Implement rate limiting by IP
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
  if (!applyRateLimit(clientIP)) {
    console.error(`Rate limit exceeded for IP [${clientIP}] [${requestId}]`);
    throw new ValidationError("Too many requests. Please try again later.");
  }

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

/**
 * Apply rate limiting based on client identifier
 * @param clientId Identifier for the client (e.g., IP address)
 * @returns Whether the request should be allowed
 */
function applyRateLimit(clientId: string): boolean {
  const now = Date.now();
  
  // Initialize or reset counter if window has passed
  if (!requestCounter[clientId] || (now - requestCounter[clientId].timestamp > RATE_LIMIT_WINDOW_MS)) {
    requestCounter[clientId] = { count: 1, timestamp: now };
    return true;
  }
  
  // Increment counter and check against limit
  requestCounter[clientId].count++;
  
  // Clean up old entries periodically (every 100 requests)
  if (Object.keys(requestCounter).length % 100 === 0) {
    cleanupRateLimiter(now);
  }
  
  // Return whether request is within rate limit
  return requestCounter[clientId].count <= RATE_LIMIT;
}

/**
 * Clean up expired rate limit entries
 * @param currentTime Current timestamp
 */
function cleanupRateLimiter(currentTime: number): void {
  for (const clientId in requestCounter) {
    if (currentTime - requestCounter[clientId].timestamp > RATE_LIMIT_WINDOW_MS) {
      delete requestCounter[clientId];
    }
  }
}
