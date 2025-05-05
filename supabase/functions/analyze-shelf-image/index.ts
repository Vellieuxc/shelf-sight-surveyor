import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { handleCorsOptions, corsHeaders } from "./cors.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";
import { handleError, ValidationError, AuthError } from "./error-handler.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";
import { 
  validateRequest, 
  transformAnalysisData, 
  generateRequestId,
  addToAnalysisQueue,
  getNextAnalysisJob,
  updateJobStatus,
  getJobByImageId
} from "./utils.ts";
import { monitorClaudeCall } from "./monitoring.ts";

// Main handler that orchestrates the analysis process
serve(async (req) => {
  // Generate a unique request ID for this request
  const requestId = generateRequestId();
  console.log(`Edge Function received request [${requestId}]:`, req.method);
  console.log(`Request headers [${requestId}]:`, Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests properly
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  // Parse URL to determine which operation to perform
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const operation = pathParts[pathParts.length - 1]; // Last path segment

  try {
    // Authenticate the request
    await authenticateRequest(req, requestId);
    
    // Route to appropriate handler based on the operation
    switch (operation) {
      case 'status':
        return await handleStatusCheck(req, requestId);
      case 'process-next':
        return await handleProcessNext(req, requestId);
      case 'analyze-shelf-image':
      default:
        return await handleAnalyzeRequest(req, requestId);
    }
  } catch (error) {
    return handleError(error, requestId);
  }
});

// Handle a standard analysis request (now just queues the job)
async function handleAnalyzeRequest(req: Request, requestId: string) {
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Check the status of a queued analysis job
async function handleStatusCheck(req: Request, requestId: string) {
  // Get the image ID from the request
  const urlParams = new URL(req.url).searchParams;
  const imageId = urlParams.get('imageId');
  
  if (!imageId) {
    throw new ValidationError("Image ID is required for status checks");
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Process the next job in the queue (worker endpoint)
async function handleProcessNext(req: Request, requestId: string) {
  // This endpoint should be called by a scheduled task or worker
  console.log(`Processing next job in queue [${requestId}]`);
  
  // Get the next job from the queue
  const job = await getNextAnalysisJob();
  
  if (!job) {
    return new Response(JSON.stringify({ 
      success: true, 
      message: "No pending jobs in queue",
      requestId
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  
  console.log(`Processing job ${job.jobId} for image ${job.imageId} (attempt ${job.attempts})`);
  
  try {
    // Process the image analysis
    const startTime = performance.now();
    const analysisData = await monitorClaudeCall(() => analyzeImageWithClaude(job.imageUrl, requestId));
    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);
    
    console.log(`Analysis completed in ${processingTimeMs}ms [${requestId}]`);
    
    // Transform the data to match our expected format
    const transformedData = transformAnalysisData(analysisData);
    
    // Update job status to completed with results
    await updateJobStatus(job.jobId, 'completed', {
      data: transformedData,
      processingTimeMs
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Job processed successfully",
      requestId,
      jobId: job.jobId,
      imageId: job.imageId,
      processingTimeMs
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error processing job ${job.jobId} [${requestId}]:`, error);
    
    // Update job status to failed
    await updateJobStatus(job.jobId, 'failed', null, error.message);
    
    return new Response(JSON.stringify({ 
      success: false, 
      message: "Failed to process job",
      error: error.message,
      requestId,
      jobId: job.jobId,
      imageId: job.imageId
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// Authenticate the request
async function authenticateRequest(req: Request, requestId: string): Promise<void> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader && Deno.env.get('REQUIRE_AUTH') === 'true') {
    console.error(`Authentication required but not provided [${requestId}]`);
    throw new AuthError("Authentication required");
  }
}
