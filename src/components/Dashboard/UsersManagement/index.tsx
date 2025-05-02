
import React from "react";
import { useUserManagement } from "./useUserManagement";
import SearchHeader from "./SearchHeader";
import UsersList from "./UsersList";
import RoleDialog from "./RoleDialog";
import BlockDialog from "./BlockDialog";
import { UserRole } from "@/types";

const UsersManagement = () => {
  const {
    users,
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
  } = useUserManagement();

  const handleRoleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Only close dialog, don't reset selected user yet
      setShowRoleDialog(false);
    } else {
      setShowRoleDialog(open);
    }
  };

  const handleBlockDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Only close dialog, don't reset selected user yet
      setShowBlockDialog(false);
    } else {
      setShowBlockDialog(open);
    }
  };

  return (
    <div className="container px-4 py-8 space-y-6">
      <SearchHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <UsersList 
        users={users}
        isLoading={isLoading}
        openRoleDialog={openRoleDialog}
        openBlockDialog={openBlockDialog}
        currentUserId={profile?.id}
      />

      <RoleDialog 
        isOpen={showRoleDialog}
        onOpenChange={handleRoleDialogOpenChange}
        selectedUser={selectedUser}
        selectedRole={selectedRole}
        setSelectedRole={(role: UserRole) => setSelectedRole(role)}
        onSave={handleRoleChange}
      />

      <BlockDialog 
        isOpen={showBlockDialog}
        onOpenChange={handleBlockDialogOpenChange}
        selectedUser={selectedUser}
        onConfirm={handleToggleBlockUser}
      />
    </div>
  );
};

export default UsersManagement;
