
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserData } from "./types";
import { UserRole } from "@/types";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { handleDatabaseError } from "@/utils/errors";

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { handleError, runSafely } = useErrorHandling({ 
    source: 'database',
    componentName: 'UserManagement' 
  });

  // Redirect non-boss users
  useEffect(() => {
    if (profile && profile.role !== "boss") {
      toast.error("You don't have access to this page");
      navigate("/dashboard");
    }
  }, [profile, navigate]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!profile || profile.role !== "boss") return;

    setIsLoading(true);
    
    const { data, error } = await runSafely(async () => {
      // Get all profiles with role information
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("email", { ascending: true });
        
      if (error) throw error;
      
      return data;
    }, { 
      operation: 'fetchUsers',
      fallbackMessage: "Failed to load users data"
    });
    
    if (!error && data) {
      const mappedUsers = data.map((user: any) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at || "Unknown",
        role: user.role,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        is_blocked: user.is_blocked || false,
      }));
      
      setUsers(mappedUsers);
    }
    
    setIsLoading(false);
  }, [profile, navigate, runSafely]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    
    const { error } = await runSafely(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      return { success: true };
    }, {
      operation: 'updateUserRole',
      fallbackMessage: `Failed to update user role to ${selectedRole}`
    });
    
    // Close dialog before state update to avoid UI issues
    setShowRoleDialog(false);
    setSelectedUser(null);
    
    if (!error) {
      // Fetch fresh data instead of updating locally
      await fetchUsers();
      toast.success(`Changed user's role to ${selectedRole}`);
    }
  };

  // Handle blocking/unblocking user
  const handleToggleBlockUser = async () => {
    if (!selectedUser) return;
    
    const newBlockedStatus = !selectedUser.is_blocked;
    
    const { error } = await runSafely(async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: newBlockedStatus })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      return { success: true };
    }, {
      operation: 'toggleUserBlock',
      fallbackMessage: newBlockedStatus ? `Failed to block user ${selectedUser.email}` : `Failed to unblock user ${selectedUser.email}`
    });
    
    // Close dialog before state update to avoid UI issues
    setShowBlockDialog(false);
    setSelectedUser(null);
    
    if (!error) {
      // Fetch fresh data instead of updating locally
      await fetchUsers();
      
      toast.success(
        newBlockedStatus 
          ? `Blocked user ${selectedUser.email}` 
          : `Unblocked user ${selectedUser.email}`
      );
    }
  };

  const openRoleDialog = (user: UserData) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setShowRoleDialog(true);
  };

  const openBlockDialog = (user: UserData) => {
    setSelectedUser(user);
    setShowBlockDialog(true);
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return {
    users: filteredUsers,
    isLoading,
    searchTerm,
    setSearchTerm,
    showRoleDialog,
    setShowRoleDialog,
    showBlockDialog,
    setShowBlockDialog,
    selectedUser,
    setSelectedUser,
    selectedRole,
    setSelectedRole,
    handleRoleChange,
    handleToggleBlockUser,
    openRoleDialog,
    openBlockDialog,
    profile
  };
};
