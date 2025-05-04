
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserData } from "../types";
import { UserRole } from "@/types";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface UseUserOperationsProps {
  fetchUsers: () => Promise<void>;
}

export const useUserOperations = ({ fetchUsers }: UseUserOperationsProps) => {
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const { runSafely } = useErrorHandling({ 
    source: 'database',
    componentName: 'UserOperations' 
  });

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

  return {
    selectedUser,
    setSelectedUser,
    selectedRole,
    setSelectedRole,
    showRoleDialog,
    setShowRoleDialog,
    showBlockDialog,
    setShowBlockDialog,
    handleRoleChange,
    handleToggleBlockUser,
    openRoleDialog,
    openBlockDialog
  };
};
