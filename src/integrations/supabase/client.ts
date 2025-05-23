
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Get Supabase URL and Key from environment variables
// Make sure we provide fallback values if environment variables are not available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://horzlrlmbfivzrmycauu.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhvcnpscmxtYmZpdnpybXljYXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMDUzNzAsImV4cCI6MjA2MTY4MTM3MH0.jMtqLKCDe19sWWX_HTUyxGZiVNUuUYu8iQYgUETTBYs';

// Create Supabase client
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
);

// Storage bucket constants
export const PICTURES_BUCKET = 'pictures';

// Verify that the pictures bucket exists, create it if it doesn't
export const verifyPicturesBucketExists = async () => {
  try {
    console.log("Verifying pictures bucket exists");
    // Check if the 'pictures' bucket exists
    const { data, error } = await supabase.storage.getBucket(PICTURES_BUCKET);
    
    if (error || !data) {
      console.log("Pictures bucket does not exist, creating it");
      // Create the bucket if it doesn't exist
      const { error: createError } = await supabase.storage.createBucket(PICTURES_BUCKET, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (createError) {
        console.error("Failed to create pictures bucket:", createError);
        throw createError;
      }
      
      console.log("Pictures bucket created, updating to public");
      // Configure bucket to allow public access to objects
      const { error: updateError } = await supabase.storage.updateBucket(PICTURES_BUCKET, {
        public: true,
      });
      
      if (updateError) {
        console.error("Failed to update pictures bucket:", updateError);
        throw updateError;
      }
      
      console.log("Pictures bucket configured successfully");
    } else {
      console.log("Pictures bucket already exists");
    }
  } catch (error) {
    console.error('Error verifying pictures bucket:', error);
    throw error;
  }
};

// Create the picture_comments table if it doesn't exist
export const verifyPictureCommentsTableExists = async () => {
  try {
    // Execute RPC function to create the table
    const { error } = await supabase.rpc('create_picture_comments_table');
    if (error) throw error;
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
