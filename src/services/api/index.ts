
import { supabase } from "@/integrations/supabase/client";

// Base API service with common methods
export class ApiService {
  protected endpoint: string;
  
  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }
  
  async getAll<T>(options: any = {}) {
    const { data, error } = await supabase
      .from(this.endpoint)
      .select(options.select || '*')
      .order(options.orderBy || 'created_at', options.ascending ? { ascending: true } : { ascending: false });
    
    if (error) throw error;
    return data as T[];
  }
  
  async getById<T>(id: string, options: any = {}) {
    const { data, error } = await supabase
      .from(this.endpoint)
      .select(options.select || '*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as T;
  }
  
  async create<T, U>(item: U) {
    const { data, error } = await supabase
      .from(this.endpoint)
      .insert(item)
      .select();
    
    if (error) throw error;
    return data[0] as T;
  }
  
  async update<T, U>(id: string, item: U) {
    const { data, error } = await supabase
      .from(this.endpoint)
      .update(item)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as T;
  }
  
  async delete(id: string) {
    const { error } = await supabase
      .from(this.endpoint)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}
