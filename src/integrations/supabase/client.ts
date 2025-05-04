
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Get Supabase URL and Key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl ?? '',
  supabaseAnonKey ?? '',
);

// Verify that the pictures bucket exists, create it if it doesn't
export const verifyPicturesBucketExists = async () => {
  try {
    // Check if the 'pictures' bucket exists
    const { data, error } = await supabase.storage.getBucket('pictures');
    
    if (error || !data) {
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket('pictures', {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) throw createError;
      
      // Configure bucket to allow public access to objects
      const { error: updateError } = await supabase.storage.updateBucket('pictures', {
        public: true,
      });
      
      if (updateError) throw updateError;
    }
  } catch (error) {
    console.error('Error verifying pictures bucket:', error);
    throw error;
  }
};

// Create the picture_comments table if it doesn't exist
export const verifyPictureCommentsTableExists = async () => {
  try {
    // First check if the table exists by trying to get a single record
    const { error } = await supabase
      .from('picture_comments')
      .select('id')
      .limit(1);
      
    if (error && error.code === '42P01') { // Relation does not exist error code
      // Execute RPC function to create the table
      const { error: createError } = await supabase.rpc('create_picture_comments_table');
      
      if (createError) throw createError;
    } else if (error) {
      // Some other error occurred
      throw error;
    }
  } catch (error) {
    console.error('Error verifying picture_comments table:', error);
  }
};

// Call this function to ensure both storage and tables exist
export const initializeResources = async () => {
  try {
    await verifyPicturesBucketExists();
    await verifyPictureCommentsTableExists();
    console.log('Storage and tables verified successfully');
  } catch (error) {
    console.error('Error initializing resources:', error);
  }
};

// Add function to verify the app is initialized on load
export const verifyAppInitialized = async () => {
  try {
    // Create RPC function for comments table if it doesn't exist
    const { error } = await supabase.rpc('create_picture_comments_function_if_not_exists');
    if (error) console.error('Error creating functions:', error);
    
    await initializeResources();
  } catch (error) {
    console.error('Error verifying app initialization:', error);
  }
};

// Export a run once function that can be called from the main app
let initialized = false;
export const runInitialization = async () => {
  if (!initialized) {
    await verifyAppInitialized();
    initialized = true;
  }
};

// Call initialization when the client is imported
runInitialization().catch(console.error);
