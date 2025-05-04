
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
  
  async getStores(projectId?: string) {
    if (projectId) {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data as Store[];
    }
    
    return this.getAll<Store>();
  }
  
  async getStore(id: string) {
    return this.getById<Store>(id);
  }
  
  async createStore(store: CreateStoreData) {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error("User not authenticated");
    
    return this.create<Store, CreateStoreData & { created_by: string }>({
      ...store,
      created_by: userId
    });
  }
  
  async getUserStores(userId: string, projectId?: string) {
    let query = supabase
      .from(this.tableName)
      .select('*')
      .eq('created_by', userId);
      
    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Store[];
  }
}

export const storesService = new StoresService();
