
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
    setShowRoleDialog(open);
    if (!open) setSelectedUser(null);
  };

  const handleBlockDialogOpenChange = (open: boolean) => {
    setShowBlockDialog(open);
    if (!open) setSelectedUser(null);
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
