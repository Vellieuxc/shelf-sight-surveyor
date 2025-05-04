
// Error handling utilities for the edge function
import { corsHeaders } from "./cors.ts";

/**
 * Handles errors and returns appropriate responses
 * @param error The error that occurred
 * @returns Response object with error details
 */
export function handleError(error: Error): Response {
  console.error("Error in analyze-shelf-image function:", error);
  
  // Format error message
  const errorMessage = error.message || "An unknown error occurred";
  const errorDetails = error.stack || "";
  
  // Return formatted error response with CORS headers
  return new Response(
    JSON.stringify({ 
      success: false, 
      error: errorMessage,
      details: errorDetails 
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    }
  );
}
