
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

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
