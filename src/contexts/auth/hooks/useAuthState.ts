
import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "../types";
import { fetchUserProfile } from "../utils/authUtils";

/**
 * Hook to manage authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user profile - now a memoized callback
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      const userProfile = await fetchUserProfile(userId);
      
      if (userProfile) {
        // Check if user is blocked
        if (userProfile.isBlocked) {
          await handleBlockedUser();
          return;
        }
        
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle blocked user scenario
  const handleBlockedUser = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      console.error("Error signing out blocked user:", error);
    }
  };

  // Handle auth state change
  const handleAuthChange = useCallback((currentSession: Session | null) => {
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    
    if (currentSession?.user) {
      // Use setTimeout to avoid Supabase auth recursion
      setTimeout(() => {
        loadUserProfile(currentSession.user.id);
      }, 0);
    } else {
      setIsLoading(false);
    }
  }, [loadUserProfile]);

  // Set up auth listeners
  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_, currentSession) => {
        handleAuthChange(currentSession);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      handleAuthChange(currentSession);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthChange]);

  return {
    user,
    session,
    profile,
    isLoading,
    setProfile,
  };
};
