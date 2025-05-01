
import { useState, useEffect } from "react";
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

  // Set up auth listeners
  useEffect(() => {
    const setupAuthListeners = () => {
      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, currentSession) => {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      );

      // Check for existing session
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
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
      });

      return subscription;
    };

    const subscription = setupAuthListeners();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile
  const loadUserProfile = async (userId: string) => {
    try {
      setIsLoading(true);
      const userProfile = await fetchUserProfile(userId);
      
      if (userProfile) {
        // Check if user is blocked
        if (userProfile.isBlocked) {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          setProfile(null);
          return;
        }
        
        setProfile(userProfile);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    setProfile,
  };
};
