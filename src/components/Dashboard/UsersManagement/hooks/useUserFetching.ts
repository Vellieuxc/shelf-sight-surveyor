
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { UserData } from "../types";
import { UserRole } from "@/types";

interface ProfileData {
  id: string;
  email: string;
  created_at?: string;
  role: string;
  is_blocked?: boolean;
  first_name?: string;
  last_name?: string;
}

export const useUserFetching = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { runSafely } = useErrorHandling({ 
    source: 'database',
    componentName: 'UserFetching' 
  });

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    
    const { data, error } = await runSafely(async () => {
      // Get all profiles with role information
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("email", { ascending: true });
        
      if (error) throw error;
      
      return data as ProfileData[];
    }, { 
      operation: 'fetchUsers',
      fallbackMessage: "Failed to load users data"
    });
    
    if (!error && data) {
      // Map the API response to the UserData type with proper role conversion
      const mappedUsers = data.map((user: ProfileData) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at || "Unknown",
        role: user.role as UserRole, // Cast to UserRole enum
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        is_blocked: user.is_blocked || false,
      }));
      
      setUsers(mappedUsers);
    }
    
    setIsLoading(false);
  }, [runSafely]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    fetchUsers,
    setUsers
  };
};
