
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define a type for valid table names from our database
export type TableName = keyof Database['public']['Tables'];

// Generic types to work with our database tables
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Base API service with common methods
export class ApiService<T extends TableName> {
  protected tableName: T;
  
  constructor(tableName: T) {
    this.tableName = tableName;
  }
  
  /**
   * Get all records from the table
   * @param options Query options for the request
   * @returns Array of records
   */
  async getAll<R = TableRow<T>>(options: { 
    select?: string; 
    orderBy?: string; 
    ascending?: boolean 
  } = {}): Promise<R[]> {
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
  
  /**
   * Get a record by ID
   * @param id Record ID
   * @param options Query options
   * @returns The requested record
   */
  async getById<R = TableRow<T>>(id: string, options: { select?: string } = {}): Promise<R> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select(options.select || '*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as R;
  }
  
  /**
   * Create a new record
   * @param item Record data to insert
   * @returns The created record
   */
  async create<R = TableRow<T>, U extends Partial<TableInsert<T>> = TableInsert<T>>(item: U): Promise<R> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item)
      .select();
    
    if (error) throw error;
    return data[0] as R;
  }
  
  /**
   * Update an existing record
   * @param id Record ID
   * @param item Updated record data
   * @returns The updated record
   */
  async update<R = TableRow<T>, U extends Partial<TableUpdate<T>> = TableUpdate<T>>(id: string, item: U): Promise<R> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(item)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0] as R;
  }
  
  /**
   * Delete a record
   * @param id Record ID
   * @returns Success indicator
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }
  
  /**
   * Query records with filters
   * @param filters Key-value pairs for filtering
   * @param options Query options
   * @returns Array of matching records
   */
  async query<R = TableRow<T>>(
    filters: Record<string, any>,
    options: { select?: string; orderBy?: string; ascending?: boolean } = {}
  ): Promise<R[]> {
    let query = supabase
      .from(this.tableName)
      .select(options.select || '*');
      
    // Apply all filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    // Apply ordering
    if (options.orderBy) {
      query.order(options.orderBy, { ascending: options.ascending ?? false });
    } else if ('created_at' in filters === false) {
      query.order('created_at', { ascending: false });
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data as R[];
  }
}

// Export utility type for creating service implementations
export type ApiServiceImplementation<T extends TableName> = {
  [K in string]: (...args: any[]) => Promise<any>;
} & ApiService<T>;
