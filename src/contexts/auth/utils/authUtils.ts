
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserProfile, UserRole } from "../types";
import { handleAuthError, handleDatabaseError } from "@/utils/errors";

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
      throw error;
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
    handleDatabaseError(error, 'fetchUserProfile', { 
      fallbackMessage: 'Unable to fetch user profile',
      additionalData: { userId }
    });
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
      .maybeSingle();
        
    if (error) {
      throw error;
    }
    
    return !!data?.is_blocked;
  } catch (error) {
    handleDatabaseError(error, 'checkIfUserIsBlocked', { 
      fallbackMessage: 'Unable to check if user is blocked',
      additionalData: { userId }
    });
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
      throw error;
    }

    if (!data.user) {
      throw new Error("No user returned from authentication");
    }

    // Check if user is blocked before proceeding
    const isBlocked = await checkIfUserIsBlocked(data.user.id);
      
    if (isBlocked) {
      throw new Error("Your account has been blocked. Please contact an administrator.");
    }
    
    toast.success("Signed in successfully");
    return { success: true, user: data.user };
  } catch (error) {
    handleAuthError(error, 'signIn', {
      additionalData: { email }
    });
    return { success: false };
  }
};

/**
 * Handles signing up a user with email and password
 */
export const handleSignUp = async (
  email: string, 
  password: string,
  userMetadata?: { firstName?: string; lastName?: string }
): Promise<{ success: boolean; user?: User }> => {
  try {
    // Prepare user metadata if provided
    const metadata = userMetadata ? {
      first_name: userMetadata.firstName,
      last_name: userMetadata.lastName
    } : undefined;
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) {
      throw error;
    }

    toast.success("Sign up successful! Please check your email for verification.");
    
    return { success: true, user: data.user ?? undefined };
  } catch (error) {
    handleAuthError(error, 'signUp', {
      additionalData: { email }
    });
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
  } catch (error) {
    handleAuthError(error, 'signOut', {
      fallbackMessage: "An error occurred during sign out"
    });
    return false;
  }
};
