
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { UserData } from "./types";
import { UserRole } from "@/types";

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
    try {
      // Get all profiles with role information
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("email", { ascending: true });
        
      if (error) throw error;
      
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
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      toast.error("Failed to load users data");
    } finally {
      setIsLoading(false);
    }
  }, [profile, navigate]);

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      // Close dialog before state update to avoid UI issues
      setShowRoleDialog(false);
      setSelectedUser(null);
      
      // Fetch fresh data instead of updating locally
      await fetchUsers();
      
      toast.success(`Changed user's role to ${selectedRole}`);
    } catch (error: any) {
      console.error("Error updating user role:", error.message);
      toast.error("Failed to update user role");
      
      // Still close dialog on error
      setShowRoleDialog(false);
      setSelectedUser(null);
    }
  };

  // Handle blocking/unblocking user
  const handleToggleBlockUser = async () => {
    if (!selectedUser) return;
    
    const newBlockedStatus = !selectedUser.is_blocked;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_blocked: newBlockedStatus })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      // Close dialog before state update to avoid UI issues
      setShowBlockDialog(false);
      setSelectedUser(null);
      
      // Fetch fresh data instead of updating locally
      await fetchUsers();
      
      toast.success(
        newBlockedStatus 
          ? `Blocked user ${selectedUser.email}` 
          : `Unblocked user ${selectedUser.email}`
      );
    } catch (error: any) {
      console.error("Error updating user blocked status:", error.message);
      toast.error("Failed to update user status");
      
      // Still close dialog on error
      setShowBlockDialog(false);
      setSelectedUser(null);
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
