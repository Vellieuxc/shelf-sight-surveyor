
import DOMPurify from 'dompurify';

// Sanitize HTML content to prevent XSS attacks
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
};

// Validate file types
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

// Validate file size
export const validateFileSize = (file: File, maxSizeInMB: number): boolean => {
  const fileSizeInMB = file.size / (1024 * 1024);
  return fileSizeInMB <= maxSizeInMB;
};

// Create a safe filename
export const createSafeFilename = (originalName: string): string => {
  // Remove potentially dangerous characters
  const safeName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
  
  // Generate a random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  
  // Extract file extension
  const parts = safeName.split('.');
  const extension = parts.length > 1 ? parts.pop() : '';
  const nameWithoutExtension = parts.join('.');
  
  // Combine with random suffix
  return `${nameWithoutExtension}_${randomSuffix}.${extension}`;
};

// Generate a random authorization token
export const generateRandomToken = (length: number = 32): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(randomValues[i] % characters.length);
  }
  
  return result;
};

// Sanitize user input to prevent injection attacks
export const sanitizeUserInput = (input: string): string => {
  if (!input) return '';
  
  // Remove script tags and other potentially dangerous HTML
  const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  
  // Further sanitize by escaping special characters
  return sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Sanitize object keys and values for API requests
export const sanitizeObjectForAPI = <T extends Record<string, any>>(obj: T): T => {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Sanitize the key
    const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
    
    // Sanitize the value based on type
    let safeValue = value;
    if (typeof value === 'string') {
      // Trim and limit string length
      safeValue = value.trim().substring(0, 5000);
    } else if (typeof value === 'number') {
      // Ensure number is within reasonable bounds
      safeValue = isFinite(value) ? value : 0;
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        // Recursively sanitize array items
        safeValue = value.map(item => 
          typeof item === 'object' ? sanitizeObjectForAPI(item) : item
        );
      } else {
        // Recursively sanitize nested objects
        safeValue = sanitizeObjectForAPI(value);
      }
    }
    
    sanitized[safeKey] = safeValue;
  }
  
  return sanitized as T;
};

// Validate URL format and allowed domains
export const validateUrl = (url: string, allowedDomains?: string[]): boolean => {
  if (!url) return false;
  
  try {
    const parsedUrl = new URL(url);
    
    // Check protocol
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false;
    }
    
    // Check against allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.some(domain => parsedUrl.hostname === domain || 
                                           parsedUrl.hostname.endsWith(`.${domain}`));
    }
    
    return true;
  } catch {
    return false;
  }
};
