
import { handleError } from "./core";
import { ErrorOptions } from "./types";

/**
 * Specialized handler for authentication errors
 * 
 * @param error The error object
 * @param operation The operation that failed
 * @param options Additional options for error handling
 */
export function handleAuthError(
  error: unknown, 
  operation: string, 
  options: Omit<ErrorOptions, 'context'> = {}
) {
  let errorMessage = "Authentication failed";
  let errorTitle = "Authentication Error";
  
  // Extract specific auth error types
  if (error && typeof error === 'object') {
    const authError = error as any;
    
    // Handle common Supabase auth errors
    if (authError.code === 'auth/invalid-email') {
      errorMessage = "Please enter a valid email address";
    } else if (authError.code === 'auth/invalid-password') {
      errorMessage = "Password must be at least 6 characters";
    } else if (authError.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already registered";
      errorTitle = "Account Exists";
    } else if (authError.code === 'auth/user-not-found') {
      errorMessage = "No account found with this email";
    } else if (authError.code === 'auth/wrong-password') {
      errorMessage = "Incorrect password";
    } else if (authError.message) {
      errorMessage = authError.message;
    }
  }
  
  return handleError(error, {
    ...options,
    fallbackMessage: errorMessage,
    title: options.title || errorTitle,
    context: {
      source: 'auth',
      operation,
      additionalData: options.additionalData
    },
  });
}
