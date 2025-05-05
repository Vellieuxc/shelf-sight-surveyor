
import { ValidationError } from "./error-handler.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Helper function to generate request IDs
export function generateRequestId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract and validate data from the request
export async function validateRequest(req: Request, requestId: string): Promise<{ imageUrl: string, imageId: string }> {
  const requestData = await req.json().catch(error => {
    console.error(`Failed to parse request body [${requestId}]:`, error);
    throw new ValidationError("Invalid request body format");
  });
  
  const { imageUrl, imageId } = requestData;
  
  if (!imageUrl) {
    console.error(`Image URL is required but was not provided [${requestId}]`);
    throw new ValidationError("Image URL is required");
  }
  
  return { imageUrl, imageId: imageId || 'unspecified' };
}

// Transform the analysis data to our application format
export function transformAnalysisData(analysisData: any[]): any[] {
  return analysisData.map(item => {
    return {
      sku_name: item.SKUFullName || '',
      brand: item.SKUBrand || '',
      sku_count: item.NumberFacings || 0,
      sku_price: parseFloat(item.PriceSKU?.replace(/[^0-9.]/g, '')) || 0,
      sku_position: item.ShelfSection || '',
      sku_confidence: item.BoundingBox?.confidence ? 
        (item.BoundingBox.confidence >= 0.9 ? 'high' : 
         item.BoundingBox.confidence >= 0.7 ? 'mid' : 'low') : 
        'unknown',
      empty_space_estimate: item.OutofStock === true ? 100 : undefined
    };
  });
}

// Queue system implementation
// For edge functions, we'll use KV store as a simple queue
// In a production environment, this would be replaced with a proper message queue service

const KV_NAMESPACE = "image_analysis_queue";

// Add a job to the analysis queue
export async function addToAnalysisQueue(job: { imageUrl: string, imageId: string }): Promise<string> {
  const jobId = crypto.randomUUID();
  const kv = await Deno.openKv();
  
  try {
    // Store job in KV with status "pending"
    // Format: [namespace, job_id] = { job data, status, timestamp }
    await kv.set([KV_NAMESPACE, jobId], {
      ...job,
      status: "pending",
      createdAt: new Date().toISOString(),
      attempts: 0
    });
    
    console.log(`Added job to queue: ${jobId} for image ${job.imageId}`);
    
    // Also store a reference by image ID for lookups
    await kv.set([KV_NAMESPACE, "by_image_id", job.imageId], jobId);
    
    return jobId;
  } finally {
    kv.close();
  }
}

// Get the next job from the queue
export async function getNextAnalysisJob(): Promise<{ jobId: string, imageUrl: string, imageId: string, attempts: number } | null> {
  const kv = await Deno.openKv();
  
  try {
    // Get all pending jobs
    const pendingJobs = kv.list<{ imageUrl: string, imageId: string, status: string, attempts: number }>({ 
      prefix: [KV_NAMESPACE]
    });
    
    // Find the first pending job
    for await (const entry of pendingJobs) {
      const jobId = entry.key[1] as string;
      const jobData = entry.value;
      
      // Skip entries that aren't actual jobs or aren't pending
      if (typeof jobId !== 'string' || jobId === 'by_image_id' || jobData.status !== 'pending') {
        continue;
      }
      
      // Mark job as in-progress
      await kv.set([KV_NAMESPACE, jobId], {
        ...jobData,
        status: "processing",
        startedAt: new Date().toISOString(),
        attempts: jobData.attempts + 1
      });
      
      return { 
        jobId, 
        imageUrl: jobData.imageUrl, 
        imageId: jobData.imageId,
        attempts: jobData.attempts + 1
      };
    }
    
    return null;  // No pending jobs
  } finally {
    kv.close();
  }
}

// Update job status after processing
export async function updateJobStatus(
  jobId: string, 
  status: 'completed' | 'failed',
  result?: any, 
  error?: string
): Promise<void> {
  const kv = await Deno.openKv();
  
  try {
    // Get current job data
    const jobEntry = await kv.get([KV_NAMESPACE, jobId]);
    if (!jobEntry.value) {
      console.error(`Job ${jobId} not found when updating status`);
      return;
    }
    
    // Update with new status
    await kv.set([KV_NAMESPACE, jobId], {
      ...jobEntry.value,
      status,
      completedAt: new Date().toISOString(),
      result: result || null,
      error: error || null
    });
    
    console.log(`Updated job ${jobId} status to: ${status}`);
  } finally {
    kv.close();
  }
}

// Get job status by image ID
export async function getJobByImageId(imageId: string): Promise<any | null> {
  const kv = await Deno.openKv();
  
  try {
    // Get job ID from image ID reference
    const jobIdEntry = await kv.get([KV_NAMESPACE, "by_image_id", imageId]);
    if (!jobIdEntry.value) {
      return null;
    }
    
    const jobId = jobIdEntry.value as string;
    
    // Get actual job data
    const jobEntry = await kv.get([KV_NAMESPACE, jobId]);
    if (!jobEntry.value) {
      return null;
    }
    
    return {
      jobId,
      ...jobEntry.value
    };
  } finally {
    kv.close();
  }
}
