
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Create a Supabase client for storing queue data
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials for queue processing');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Add a job to the analysis queue
export async function addToAnalysisQueue(job: { imageUrl: string, imageId: string }): Promise<string> {
  const jobId = crypto.randomUUID();
  const supabase = getSupabaseClient();
  
  try {
    // Store job in analysis_queue table
    const { error } = await supabase
      .from('analysis_queue')
      .insert({
        job_id: jobId,
        image_id: job.imageId,
        image_url: job.imageUrl,
        status: "pending",
        attempts: 0,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error(`Error adding job to queue: ${error.message}`);
      throw error;
    }
    
    console.log(`Added job to queue: ${jobId} for image ${job.imageId}`);
    return jobId;
  } catch (error) {
    console.error(`Failed to add job to queue: ${error.message}`);
    throw error;
  }
}

// Get the next job from the queue
export async function getNextAnalysisJob(): Promise<{ jobId: string, imageUrl: string, imageId: string, attempts: number } | null> {
  const supabase = getSupabaseClient();
  
  try {
    // Get oldest pending job
    const { data, error } = await supabase
      .from('analysis_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();
    
    if (error || !data) {
      if (error && error.code !== 'PGRST116') { // Not error when no results
        console.error(`Error fetching next job: ${error.message}`);
      }
      return null;
    }
    
    // Mark job as in-progress
    const { error: updateError } = await supabase
      .from('analysis_queue')
      .update({
        status: 'processing',
        started_at: new Date().toISOString(),
        attempts: data.attempts + 1
      })
      .eq('job_id', data.job_id);
      
    if (updateError) {
      console.error(`Error updating job status: ${updateError.message}`);
      return null;
    }
    
    return {
      jobId: data.job_id,
      imageUrl: data.image_url,
      imageId: data.image_id,
      attempts: data.attempts + 1
    };
  } catch (error) {
    console.error(`Error in getNextAnalysisJob: ${error.message}`);
    return null;
  }
}

// Update job status after processing
export async function updateJobStatus(
  jobId: string, 
  status: 'completed' | 'failed',
  result?: any, 
  error?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  
  try {
    const { error: updateError } = await supabase
      .from('analysis_queue')
      .update({
        status,
        completed_at: new Date().toISOString(),
        result: result || null,
        error_message: error || null
      })
      .eq('job_id', jobId);
      
    if (updateError) {
      console.error(`Error updating job status: ${updateError.message}`);
      throw updateError;
    }
    
    console.log(`Updated job ${jobId} status to: ${status}`);
  } catch (error) {
    console.error(`Error in updateJobStatus: ${error.message}`);
    throw error;
  }
}

// Get job status by image ID
export async function getJobByImageId(imageId: string): Promise<any | null> {
  const supabase = getSupabaseClient();
  
  try {
    const { data, error } = await supabase
      .from('analysis_queue')
      .select('*')
      .eq('image_id', imageId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error || !data) {
      if (error && error.code !== 'PGRST116') { // Not error when no results
        console.error(`Error fetching job by image ID: ${error.message}`);
      }
      return null;
    }
    
    return {
      jobId: data.job_id,
      status: data.status,
      imageId: data.image_id,
      imageUrl: data.image_url,
      createdAt: data.created_at,
      result: data.result,
      error: data.error_message
    };
  } catch (error) {
    console.error(`Error in getJobByImageId: ${error.message}`);
    return null;
  }
}
