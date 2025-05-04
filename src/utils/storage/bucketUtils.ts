
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";

// Constants
const BUCKET_NAME = 'pictures';

/**
 * Verify that a storage bucket exists or create it
 */
export async function verifyBucketExists(bucket: string): Promise<boolean> {
  try {
    console.log(`Verifying bucket exists: ${bucket}`);
    
    // Check if the bucket exists
    const { data, error } = await supabase.storage.getBucket(bucket);
    
    if (error || !data) {
      console.log(`Bucket ${bucket} not found, attempting to create it`);
      
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error(`Failed to create bucket ${bucket}:`, createError);
        throw createError;
      }
      
      console.log(`Bucket ${bucket} created, updating to public`);
      
      // Configure bucket to allow public access to objects
      const { error: updateError } = await supabase.storage.updateBucket(bucket, {
        public: true,
      });
      
      if (updateError) {
        console.error(`Failed to update bucket ${bucket}:`, updateError);
        throw updateError;
      }
      
      console.log(`Bucket ${bucket} configured successfully`);
    } else {
      console.log(`Bucket ${bucket} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error in verifyBucketExists for bucket ${bucket}:`, error);
    
    handleError(error, { 
      fallbackMessage: `Failed to verify or create ${bucket} storage bucket`,
      operation: 'verifyBucketExists',
      context: {
        source: 'storage',
        operation: 'verifyBucketExists'
      }
    });
    return false;
  }
}

// Helper function to ensure the pictures bucket exists
export async function ensurePicturesBucketExists(): Promise<boolean> {
  return verifyBucketExists(BUCKET_NAME);
}
