
import { transformAnalysisData } from "./transformers.ts";
import { generateRequestId } from "./utils.ts";
import { getNextAnalysisJob, updateJobStatus } from "./queue.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";
import { corsHeaders } from "./cors.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};

// Process the next job in the queue (worker endpoint)
export async function handleProcessNext(req: Request, requestId: string): Promise<Response> {
  // This endpoint should be called by a scheduled task or worker
  console.log(`Processing next job in queue [${requestId}]`);
  
  // Get the next job from the queue
  const job = await getNextAnalysisJob();
  
  if (!job) {
    console.log(`No pending jobs in queue [${requestId}]`);
    return new Response(JSON.stringify({ 
      success: true, 
      message: "No pending jobs in queue",
      requestId
    }), {
      headers: securityHeaders,
      status: 200
    });
  }
  
  console.log(`Processing job ${job.jobId} for image ${job.imageId} (attempt ${job.attempts}) [${requestId}]`);
  
  try {
    // Process the image analysis with Claude
    const startTime = performance.now();
    console.log(`Starting Claude analysis for job ${job.jobId} [${requestId}]`);
    console.log(`Using image URL: ${job.imageUrl} [${requestId}]`);
    
    const analysisData = await analyzeImageWithClaude(job.imageUrl, requestId);
    const endTime = performance.now();
    const processingTimeMs = Math.round(endTime - startTime);
    
    console.log(`Analysis completed in ${processingTimeMs}ms [${requestId}]`);
    
    // Update job status to completed with results
    console.log(`Updating job status to completed [${requestId}]`);
    await updateJobStatus(job.jobId, 'completed', {
      data: analysisData,
      processingTimeMs
    });
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: "Job processed successfully",
      requestId,
      jobId: job.jobId,
      imageId: job.imageId,
      processingTimeMs,
      data: analysisData
    }), {
      headers: securityHeaders,
      status: 200
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
      headers: securityHeaders,
    });
  }
}
