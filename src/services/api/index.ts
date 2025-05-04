
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

// Define type for table names in our database
export type TableName = keyof Database['public']['Tables'];

/**
 * Base API service with common CRUD operations for Supabase tables
 * @template T The table name from the database schema
 */
export class ApiService<T extends TableName> {
  protected tableName: T;
  
  /**
   * Create a new API service for a specific table
   * @param tableName The name of the table in the database
   */
  constructor(tableName: T) {
    this.tableName = tableName;
  }
  
  /**
   * Get all records from the table
   * @param options Query options for the request
   * @returns Array of records
   */
  async getAll<R = Database['public']['Tables'][T]['Row']>(options: { 
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
  async getById<R = Database['public']['Tables'][T]['Row']>(id: string, options: { select?: string } = {}): Promise<R> {
    // We need to use a type assertion here because Supabase's types are restrictive
    const { data, error } = await supabase
      .from(this.tableName)
      .select(options.select || '*')
      .eq('id' as any, id)
      .single();
    
    if (error) throw error;
    return data as R;
  }
  
  /**
   * Create a new record
   * @param item Record data to insert
   * @returns The created record
   */
  async create<R = Database['public']['Tables'][T]['Row'], U = Database['public']['Tables'][T]['Insert']>(item: U): Promise<R> {
    // We need to use a type assertion for the insert operation
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(item as any)
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
  async update<R = Database['public']['Tables'][T]['Row'], U = Partial<Database['public']['Tables'][T]['Update']>>(
    id: string, 
    item: U
  ): Promise<R> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(item as any)
      .eq('id' as any, id)
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
      .eq('id' as any, id);
    
    if (error) throw error;
    return true;
  }
  
  /**
   * Query records with filters
   * @param filters Key-value pairs for filtering
   * @param options Query options
   * @returns Array of matching records
   */
  async query<R = Database['public']['Tables'][T]['Row']>(
    filters: Record<string, any>,
    options: { select?: string; orderBy?: string; ascending?: boolean } = {}
  ): Promise<R[]> {
    let query = supabase
      .from(this.tableName)
      .select(options.select || '*');
      
    // Apply all filters
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key as any, value);
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

/**
 * Export utility type for creating service implementations
 * This allows strongly-typed service classes extending the base ApiService
 */
export type ApiServiceImplementation<T extends TableName> = {
  [K in string]: (...args: any[]) => Promise<any>;
} & ApiService<T>;
