
import { Picture } from "@/types";
import { ApiService } from "./index";
import { supabase } from "@/integrations/supabase/client";

export interface CreatePictureData {
  store_id: string;
  image_url: string;
  analysis_data?: any;
}

/**
 * Service for managing pictures
 */
export class PicturesService extends ApiService<'pictures'> {
  constructor() {
    super('pictures');
  }
  
  /**
   * Get pictures, optionally filtered by store ID
   * @param storeId Optional store ID filter
   * @returns Promise with array of pictures
   */
  async getPictures(storeId?: string): Promise<Picture[]> {
    if (storeId) {
      return this.query<Picture>({ store_id: storeId });
    }
    
    return this.getAll<Picture>();
  }
  
  /**
   * Get a specific picture by ID
   * @param id Picture ID
   * @returns Promise with picture details
   */
  async getPicture(id: string): Promise<Picture> {
    return this.getById<Picture>(id);
  }
  
  /**
   * Create a new picture
   * @param picture Picture data
   * @returns Promise with created picture
   */
  async createPicture(picture: CreatePictureData): Promise<Picture> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.create<Picture, any>({
      ...picture,
      uploaded_by: userId
    });
  }
  
  /**
   * Delete a picture by ID
   * @param id Picture ID
   * @returns Promise resolving to true if successful
   */
  async deletePicture(id: string): Promise<boolean> {
    try {
      // First, get the picture to get its image URL
      const { data: picture, error: getError } = await supabase
        .from('pictures')
        .select('image_url')
        .eq('id', id)
        .maybeSingle();
      
      if (getError) throw getError;
      if (!picture) throw new Error("Picture not found");
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('pictures')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;
      
      // Extract the file path from the image URL
      // URL format: https://[project-ref].supabase.co/storage/v1/object/public/[bucket]/[filepath]
      // We need to extract the filepath
      try {
        const urlParts = picture.image_url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const pathParts = urlParts[1].split('/', 1);
          const bucket = pathParts[0];
          const filePath = urlParts[1].substring(bucket.length + 1); // +1 for the '/'
          
          // Delete the file from storage
          const { error: storageError } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
          
          if (storageError) {
            console.error("Failed to delete file from storage:", storageError);
          }
        }
      } catch (error) {
        console.error("Error parsing image URL:", error);
      }
      
      return true;
    } catch (error) {
      console.error("Error deleting picture:", error);
      throw error;
    }
  }
  
  /**
   * Update analysis data for a picture
   * @param id Picture ID
   * @param analysisData Analysis results
   * @returns Promise with updated picture
   */
  async updateAnalysisData(id: string, analysisData: any): Promise<Picture> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.update<Picture, any>(id, { 
      analysis_data: analysisData,
      last_edited_at: new Date().toISOString(),
      last_edited_by: userId
    });
  }
}

export const picturesService = new PicturesService();
