
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useUserFetching } from "./useUserFetching";
import { useUserOperations } from "./useUserOperations";
import { toast } from "sonner";

export const useUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // User fetching hook
  const { users, isLoading, fetchUsers } = useUserFetching();
  
  // User operations hook
  const {
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
  } = useUserOperations({ fetchUsers });

  // Redirect non-boss users
  useEffect(() => {
    if (profile && profile.role !== "boss") {
      toast.error("You don't have access to this page");
      navigate("/dashboard");
    }
  }, [profile, navigate]);
  
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
