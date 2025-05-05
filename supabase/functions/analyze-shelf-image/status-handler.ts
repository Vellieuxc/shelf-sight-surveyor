import { corsHeaders } from "./cors.ts";
import { getJobByImageId } from "./utils.ts";
import { ValidationError } from "./error-handler.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; img-src *;"
};

// Check the status of a queued analysis job
export async function handleStatusCheck(req: Request, requestId: string): Promise<Response> {
  // Get the image ID from the request body instead of URL params
  const requestData = await req.json().catch(() => ({}));
  const imageId = requestData.imageId;
  
  if (!imageId) {
    throw new ValidationError("Image ID is required for status checks");
  }
  
  // Validate imageId format
  if (typeof imageId !== 'string' || imageId.length > 100) {
    throw new ValidationError("Invalid image ID format");
  }
  
  // Get job status from the queue
  const jobData = await getJobByImageId(imageId);
  
  if (!jobData) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: "No analysis job found for this image ID",
      requestId,
      imageId
    }), {
      status: 404,
      headers: securityHeaders,
    });
  }
  
  // If job is completed, return the results
  if (jobData.status === 'completed' && jobData.result) {
    return new Response(JSON.stringify({ 
      success: true, 
      data: jobData.result,
      requestId,
      status: "completed",
      processingTimeMs: jobData.processingTimeMs || 0
    }), {
      headers: securityHeaders,
    });
  }
  
  // Otherwise return job status
  return new Response(JSON.stringify({ 
    success: true, 
    status: jobData.status,
    message: jobData.status === 'failed' ? jobData.error : `Analysis job is ${jobData.status}`,
    requestId,
    jobId: jobData.jobId,
    imageId,
    createdAt: jobData.createdAt,
    attempts: jobData.attempts
  }), {
    headers: securityHeaders,
  });
}
