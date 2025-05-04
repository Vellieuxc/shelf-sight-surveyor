
import { supabase } from "@/integrations/supabase/client";
import { handleError } from "@/utils/errors";

/**
 * Verify that a storage bucket exists or create it
 */
export async function verifyBucketExists(bucket: string): Promise<boolean> {
  try {
    // Check if the bucket exists
    const { data, error } = await supabase.storage.getBucket(bucket);
    
    if (error || !data) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        throw createError;
      }
      
      // Configure bucket to allow public access to objects
      const { error: updateError } = await supabase.storage.updateBucket(bucket, {
        public: true,
      });
      
      if (updateError) {
        throw updateError;
      }
    }
    
    return true;
  } catch (error) {
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
