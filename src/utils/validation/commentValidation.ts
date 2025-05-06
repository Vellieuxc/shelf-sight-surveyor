
import { sanitizeUserInput } from "@/utils/securityUtils";

/**
 * Maximum allowed length for comment content
 */
const MAX_COMMENT_LENGTH = 1000;

/**
 * Validates and sanitizes comment content
 * @param content Raw comment content from user input
 * @returns Object containing the sanitized content and validation status
 */
export const validateAndSanitizeComment = (content: string): { 
  isValid: boolean;
  sanitizedContent: string;
  errors: string[];
} => {
  // Initialize results
  const result = {
    isValid: true,
    sanitizedContent: '',
    errors: [] as string[]
  };
  
  // Check for empty content
  if (!content || content.trim() === '') {
    result.isValid = false;
    result.errors.push('Comment cannot be empty');
    return result;
  }
  
  // Check length
  if (content.length > MAX_COMMENT_LENGTH) {
    result.isValid = false;
    result.errors.push(`Comment must be less than ${MAX_COMMENT_LENGTH} characters`);
  }
  
  // Check for potentially malicious patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi,                                        // JavaScript protocol
    /on\w+=/gi,                                             // Inline event handlers
    /data:/gi                                               // Data URIs which can contain executable code
  ];
  
  suspiciousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      result.isValid = false;
      result.errors.push('Comment contains disallowed content');
    }
  });
  
  // Always sanitize the content even if validation failed
  // This ensures we never store unsanitized content
  result.sanitizedContent = sanitizeUserInput(content);
  
  return result;
};

/**
 * Basic validation for picture IDs
 */
export const validatePictureId = (pictureId: string): boolean => {
  // Simple UUID validation (basic pattern check)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof pictureId === 'string' && uuidPattern.test(pictureId);
};
