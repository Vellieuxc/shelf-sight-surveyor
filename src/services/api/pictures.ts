
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
