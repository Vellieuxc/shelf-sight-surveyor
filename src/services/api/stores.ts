
import { Store } from "@/types";
import { ApiService } from "./index";
import { supabase } from "@/integrations/supabase/client";

export interface CreateStoreData {
  name: string;
  address: string;
  country: string;
  type: string;
  project_id: string;
  google_map_pin?: string | null;
  store_image?: string | null;
}

export class StoresService extends ApiService<'stores'> {
  constructor() {
    super('stores');
  }
  
  /**
   * Get stores, optionally filtered by project ID
   * @param projectId Optional project ID filter
   * @returns Array of stores
   */
  async getStores(projectId?: string): Promise<Store[]> {
    if (projectId) {
      return this.query<Store>({ project_id: projectId });
    }
    
    return this.getAll<Store>();
  }
  
  /**
   * Get a specific store by ID
   * @param id Store ID
   * @returns Store details
   */
  async getStore(id: string): Promise<Store> {
    return this.getById<Store>(id);
  }
  
  /**
   * Create a new store
   * @param store Store data
   * @returns Created store
   */
  async createStore(store: CreateStoreData): Promise<Store> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.create<Store, CreateStoreData & { created_by: string }>({
      ...store,
      created_by: userId
    });
  }
  
  /**
   * Get stores created by a specific user
   * @param userId User ID
   * @param projectId Optional project ID filter
   * @returns Array of user's stores
   */
  async getUserStores(userId: string, projectId?: string): Promise<Store[]> {
    const filters: Record<string, any> = { created_by: userId };
    
    if (projectId) {
      filters.project_id = projectId;
    }
    
    return this.query<Store>(filters);
  }
}

export const storesService = new StoresService();
