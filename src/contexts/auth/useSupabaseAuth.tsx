
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthState } from "./hooks/useAuthState";
import { 
  handleSignIn as authSignIn,
  handleSignUp as authSignUp,
  handleSignOut as authSignOut
} from "./utils/authUtils";
import { 
  clearExposedTokens, 
  shouldRefreshToken,
  refreshTokenIfNeeded,
  verifyTokenIntegrity
} from "@/utils/securityUtils/tokenManagement";
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSupabaseAuth = () => {
  // Use navigate with a try-catch to handle cases where router context might not be available
  let navigate;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Router context not available for navigation");
  }

  const { user, session, profile, isLoading, setProfile } = useAuthState();

  // Security enhancement: Prevent token leakage
  useEffect(() => {
    // Clear any exposed tokens when auth state changes
    clearExposedTokens();
    
    // Set up periodic token exposure check
    const intervalId = setInterval(clearExposedTokens, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle token refresh function
  const handleTokenRefresh = useCallback(async () => {
    try {
      await supabase.auth.refreshSession();
      console.debug('Token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  }, []);
  
  // Security enhancement: Handle token refresh when close to expiration
  useEffect(() => {
    if (!session) return;
    
    // Verify token integrity
    if (session.access_token && !verifyTokenIntegrity(session.access_token)) {
      // If token integrity check fails, sign out for security
      console.warn('Token integrity check failed, signing out');
      authSignOut().then(() => {
        if (navigate) navigate("/auth");
      });
      return;
    }
    
    // Set up initial token refresh check
    refreshTokenIfNeeded(session, handleTokenRefresh);
    
    // Set up periodic token refresh checks (every 4 minutes)
    const refreshCheckInterval = setInterval(() => {
      refreshTokenIfNeeded(session, handleTokenRefresh);
    }, 240000); // Check every 4 minutes
    
    return () => clearInterval(refreshCheckInterval);
  }, [session, handleTokenRefresh, navigate]);

  // Handle user sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { success, user: signedInUser } = await authSignIn(email, password);
      
      if (success && signedInUser && navigate) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  // Handle user sign up
  const signUp = async (
    email: string, 
    password: string, 
    userMetadata?: { firstName?: string; lastName?: string }
  ) => {
    try {
      const { success, user: signedUpUser } = await authSignUp(email, password, userMetadata);
      
      // For development, we can auto-sign in
      if (success && signedUpUser && navigate) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  // Handle user sign out - enhanced with token cleanup
  const signOut = async () => {
    try {
      // First clear any potentially exposed tokens
      clearExposedTokens();
      
      // Then proceed with sign out
      const success = await authSignOut();
      if (success && navigate) {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut
  };
};
