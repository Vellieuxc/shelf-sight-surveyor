
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define a type for valid table names from our database
export type TableName = keyof Database['public']['Tables'];

// Base API service with common methods
export class ApiService<T extends TableName> {
  protected tableName: T;
  
  constructor(tableName: T) {
    this.tableName = tableName;
  }
  
  async getAll<R>(options: { select?: string; orderBy?: string; ascending?: boolean } = {}) {
    const query = supabase
      .from(this.tableName)
      .select(options.select || '*');
      
    if (options.orderBy) {
      query.order(options.orderBy, { ascending: options.ascending ?? false });
    } else {
      query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as R[];
  }
  
  async getById<R>(id: string, options: { select?: string } = {}) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(options.select || '*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as R;
  }
  
  async create<R, U extends Record<string, any>>(item: U) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item as any)
      .select();
    
    if (error) throw error;
    return data[0] as R;
  }
  
  async update<R, U extends Record<string, any>>(id: string, item: U) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(item as any)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as R;
  }
  
  async delete(id: string) {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
}
