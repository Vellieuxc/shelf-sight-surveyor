
import { corsHeaders } from "./cors.ts";
import { validateRequest, addToAnalysisQueue } from "./utils.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; img-src *; connect-src *;"
};

// Handle a standard analysis request (now just queues the job)
export async function handleAnalyzeRequest(req: Request, requestId: string): Promise<Response> {
  // Extract and validate the request data
  const validatedData = await validateRequest(req, requestId);
  const { imageUrl, imageId } = validatedData;
  
  console.log(`Queueing analysis for image [${requestId}]: ${imageId}`);
  console.log(`Image URL [${requestId}]: ${imageUrl}`);

  // Add the job to the analysis queue
  const jobId = await addToAnalysisQueue({ imageUrl, imageId });
  
  // Return a response indicating the job was queued
  return new Response(JSON.stringify({ 
    success: true, 
    message: "Analysis job queued successfully",
    requestId,
    jobId,
    imageId,
    status: "queued"
  }), {
    headers: securityHeaders,
  });
}
