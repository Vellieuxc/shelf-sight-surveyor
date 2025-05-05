
import { transformAnalysisData, generateRequestId, getNextAnalysisJob, updateJobStatus } from "./utils.ts";
import { analyzeImageWithClaude } from "./claude-service.ts";
import { monitorClaudeCall } from "./monitoring.ts";
import { corsHeaders } from "./cors.ts";

// Security headers combined with CORS
const securityHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; img-src *; connect-src *;"
};

// Process the next job in the queue (worker endpoint)
export async function handleProcessNext(req: Request, requestId: string): Promise<Response> {
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
      headers: securityHeaders,
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
      headers: securityHeaders,
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
