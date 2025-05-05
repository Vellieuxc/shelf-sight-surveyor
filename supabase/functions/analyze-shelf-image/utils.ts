import { ValidationError } from "./error-handler.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Helper function to generate request IDs
export function generateRequestId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Enhanced input validation with security checks
export async function validateRequest(req: Request, requestId: string): Promise<{ imageUrl: string, imageId: string }> {
  const requestData = await req.json().catch(error => {
    console.error(`Failed to parse request body [${requestId}]:`, error);
    throw new ValidationError("Invalid request body format");
  });
  
  const { imageUrl, imageId } = requestData;
  
  // Validate imageUrl is present
  if (!imageUrl) {
    console.error(`Image URL is required but was not provided [${requestId}]`);
    throw new ValidationError("Image URL is required");
  }
  
  // Validate imageUrl is a string and has a reasonable length
  if (typeof imageUrl !== 'string' || imageUrl.length > 2048) {
    console.error(`Invalid image URL format or length [${requestId}]`);
    throw new ValidationError("Image URL must be a valid string less than 2048 characters");
  }
  
  // Validate the URL format (basic validation)
  try {
    new URL(imageUrl);
  } catch (e) {
    console.error(`Invalid URL format [${requestId}]:`, e);
    throw new ValidationError("Image URL must be a valid URL");
  }
  
  // Validate imageId if provided
  if (imageId && (typeof imageId !== 'string' || imageId.length > 100)) {
    console.error(`Invalid image ID format or length [${requestId}]`);
    throw new ValidationError("Image ID must be a valid string less than 100 characters");
  }
  
  // Sanitize inputs before returning
  const sanitizedImageUrl = encodeURI(decodeURI(imageUrl)); // Re-encode after decoding to normalize
  const sanitizedImageId = imageId ? imageId.replace(/[^a-zA-Z0-9_\-\.]/g, '') : 'unspecified';
  
  return { imageUrl: sanitizedImageUrl, imageId: sanitizedImageId };
}

// Transform the analysis data to our application format with enhanced security
export function transformAnalysisData(analysisData: any[]): any[] {
  // Validate input is an array
  if (!Array.isArray(analysisData)) {
    console.error("Invalid analysis data format: not an array");
    return [];
  }
  
  return analysisData.map(item => {
    // Skip invalid items
    if (!item || typeof item !== 'object') {
      console.warn("Skipping invalid analysis item:", item);
      return null;
    }
    
    // Safely extract values with type checking and sanitization
    const skuName = typeof item.SKUFullName === 'string' ? item.SKUFullName.substring(0, 255) : '';
    const brand = typeof item.SKUBrand === 'string' ? item.SKUBrand.substring(0, 100) : '';
    const facings = typeof item.NumberFacings === 'number' ? 
      Math.max(0, Math.min(1000, Math.round(item.NumberFacings))) : 
      (parseInt(item.NumberFacings) || 0);
    
    // Safe price parsing with fallback
    let price = 0;
    if (typeof item.PriceSKU === 'string') {
      const priceString = item.PriceSKU.replace(/[^0-9.]/g, '');
      price = parseFloat(priceString) || 0;
      // Sanitize: Ensure price is reasonable (between 0 and 1,000,000)
      price = Math.max(0, Math.min(1000000, price));
    }
    
    const position = typeof item.ShelfSection === 'string' ? item.ShelfSection.substring(0, 100) : '';
    
    // Get confidence level with validation
    let confidence = 'unknown';
    if (item.BoundingBox && typeof item.BoundingBox.confidence === 'number') {
      const conf = item.BoundingBox.confidence;
      // Clamp confidence value
      const clampedConf = Math.max(0, Math.min(1, conf));
      if (clampedConf >= 0.9) confidence = 'high';
      else if (clampedConf >= 0.7) confidence = 'mid';
      else confidence = 'low';
    }
    
    // Determine empty space estimate
    let emptySpaceEstimate;
    if (item.OutofStock === true) {
      emptySpaceEstimate = 100;
    }
    
    return {
      sku_name: skuName,
      brand: brand,
      sku_count: facings,
      sku_price: price,
      sku_position: position,
      sku_confidence: confidence,
      empty_space_estimate: emptySpaceEstimate
    };
  }).filter(Boolean); // Filter out any null entries
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
