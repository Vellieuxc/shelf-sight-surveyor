
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
