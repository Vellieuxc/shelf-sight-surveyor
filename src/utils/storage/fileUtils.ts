
import { supabase } from "@/integrations/supabase/client";
import { verifyBucketExists } from "./bucketUtils";
import { createSafeImageFilename } from "@/utils/imageUtils";

export interface UploadOptions {
  bucket?: string;
  folder?: string;
  customPath?: string;
  onSuccess?: (url: string, path: string) => void;
  onError?: (error: unknown) => void;
}

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File, 
  options: UploadOptions = {}
): Promise<string | null> {
  const { 
    bucket = 'pictures', 
    folder = '',
    customPath,
    onSuccess,
    onError
  } = options;

  try {
    // Verify bucket exists
    const bucketExists = await verifyBucketExists(bucket);
    if (!bucketExists) {
      throw new Error("Storage bucket not available");
    }
    
    // Generate safe filename and path
    const safeFilename = createSafeImageFilename(file.name);
    const filePath = customPath || 
      (folder ? `${folder}/${safeFilename}` : safeFilename);
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error("Failed to get public URL for uploaded file");
    }
    
    onSuccess?.(publicUrlData.publicUrl, filePath);
    return publicUrlData.publicUrl;
    
  } catch (error) {
    onError?.(error);
    return null;
  }
}

/**
 * Get public URL for a file
 */
export function getPublicUrl(bucket: string, filePath: string): string | null {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);
  
  return data?.publicUrl || null;
}

/**
 * Delete file from storage
 */
export async function deleteFile(bucket: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}
