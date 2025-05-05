
// Error handling utilities for the edge function
import { corsHeaders } from "./cors.ts";

/**
 * Custom error classes for different types of errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class ExternalServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExternalServiceError";
  }
}

/**
 * Determines the appropriate HTTP status code based on error type
 * @param error The error object
 * @returns The HTTP status code to use
 */
function getErrorStatusCode(error: Error): number {
  switch(error.name) {
    case "ValidationError":
      return 400; // Bad Request
    case "AuthError":
      return 401; // Unauthorized
    case "ExternalServiceError":
      return 502; // Bad Gateway
    default:
      return 500; // Internal Server Error
  }
}

/**
 * Handles errors and returns appropriate responses with detailed classification
 * @param error The error that occurred
 * @param requestId Unique identifier for the request
 * @returns Response object with error details
 */
export function handleError(error: Error, requestId: string): Response {
  const status = getErrorStatusCode(error);
  
  // Format structured log with request ID
  console.error(`Error in analyze-shelf-image function [${requestId}]:`, {
    requestId,
    errorType: error.name,
    errorMessage: error.message,
    errorStack: error.stack,
    statusCode: status
  });
  
  // Return formatted error response with CORS headers and appropriate status
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: error.message || "An unknown error occurred",
      errorType: error.name,
      requestId,
      status
    }),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}

