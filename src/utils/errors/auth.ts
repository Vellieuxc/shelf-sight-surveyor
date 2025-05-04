
import { handleError, ErrorOptions, FormattedError } from './core';

/**
 * Specific handler for authentication errors
 */
export function handleAuthError(
  error: unknown, 
  operation: string, 
  options: Omit<ErrorOptions, "context"> = {}
): FormattedError {
  // Special handling for common auth errors to make them more user-friendly
  let friendlyMessage = '';
  
  if (error instanceof Error) {
    if (error.message.includes('User already registered')) {
      friendlyMessage = 'An account with this email already exists.';
    } else if (error.message.includes('Invalid login credentials')) {
      friendlyMessage = 'Invalid email or password. Please try again.';
    }
  }
  
  return handleError(error, {
    ...options,
    fallbackMessage: `Authentication failed: ${operation}`,
    // Use the friendly message if available, otherwise use default extraction
    ...(friendlyMessage && { fallbackMessage: friendlyMessage }),
    context: {
      source: 'auth',
      operation,
      additionalData: options.additionalData
    }
  });
}
