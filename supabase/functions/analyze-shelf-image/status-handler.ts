
import { corsHeaders } from "./cors.ts";
import { getJobByImageId } from "./queue.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY'
};

// Handle status check requests
export async function handleStatusCheck(req: Request, requestId: string): Promise<Response> {
  try {
    // Parse the request body
    const data = await req.json();
    const { imageId } = data;

    if (!imageId) {
      throw new Error("Image ID is required");
    }

    console.log(`Checking status for image [${requestId}]: ${imageId}`);
    
    // Get job status from the queue
    const job = await getJobByImageId(imageId);
    
    if (!job) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No analysis job found for the provided image ID",
          requestId
        }),
        { status: 404, headers: securityHeaders }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        status: job.status,
        jobId: job.jobId,
        imageId: job.imageId,
        createdAt: job.createdAt,
        data: job.result || null,
        requestId
      }),
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error(`Error checking status [${requestId}]:`, error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to check job status",
        requestId
      }),
      { status: 500, headers: securityHeaders }
    );
  }
}
