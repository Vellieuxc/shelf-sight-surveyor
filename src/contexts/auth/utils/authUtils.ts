
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile, UserRole } from "../types";

/**
 * Fetches a user profile from the database
 */
export const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
    
    return {
      id: data.id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: data.role as UserRole,
      isBlocked: data.is_blocked
    };
  } catch (error) {
    console.error("Unexpected error fetching profile:", error);
    return null;
  }
};

/**
 * Checks if a user is blocked in the database
 */
export const checkIfUserIsBlocked = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_blocked")
      .eq("id", userId)
      .single();
        
    if (error) {
      console.error("Error checking if user is blocked:", error);
      return false;
    }
    
    return !!data.is_blocked;
  } catch (error) {
    console.error("Unexpected error checking blocked status:", error);
    return false;
  }
};

/**
 * Handles signing in a user with email and password
 */
export const handleSignIn = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      toast.error(error.message);
      return { success: false };
    }

    if (!data.user) {
      return { success: false };
    }

    // Check if user is blocked before proceeding
    const isBlocked = await checkIfUserIsBlocked(data.user.id);
      
    if (isBlocked) {
      toast.error("Your account has been blocked. Please contact an administrator.");
      await supabase.auth.signOut();
      return { success: false };
    }
    
    toast.success("Signed in successfully");
    return { success: true, user: data.user };
  } catch (error: any) {
    toast.error(error.message || "An error occurred during sign in");
    return { success: false };
  }
};

/**
 * Handles signing up a user with email and password
 */
export const handleSignUp = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User }> => {
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) {
      toast.error(error.message);
      return { success: false };
    }

    toast.success("Sign up successful! Please check your email for verification.");
    
    return { success: true, user: data.user ?? undefined };
  } catch (error: any) {
    toast.error(error.message || "An error occurred during sign up");
    return { success: false };
  }
};

/**
 * Handles signing out a user
 */
export const handleSignOut = async (): Promise<boolean> => {
  try {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    return true;
  } catch (error: any) {
    toast.error(error.message || "An error occurred during sign out");
    return false;
  }
};
