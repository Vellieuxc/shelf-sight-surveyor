
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { UserData } from "./types";
import { UserRole } from "@/types";

interface RoleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  selectedRole: UserRole | null;
  setSelectedRole: (role: UserRole) => void;
  onSave: () => Promise<void>;
}

const RoleDialog: React.FC<RoleDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedUser,
  selectedRole,
  setSelectedRole,
  onSave
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Change User Role</AlertDialogTitle>
          <AlertDialogDescription>
            Change the role for {selectedUser?.email}. This will modify their permissions in the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex justify-between gap-2">
            <Button 
              variant={selectedRole === UserRole.CREW ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedRole(UserRole.CREW)}
            >
              Crew
            </Button>
            <Button 
              variant={selectedRole === UserRole.CONSULTANT ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedRole(UserRole.CONSULTANT)}
            >
              Consultant
            </Button>
            <Button 
              variant={selectedRole === UserRole.BOSS ? "default" : "outline"}
              className="flex-1"
              onClick={() => setSelectedRole(UserRole.BOSS)}
            >
              Boss
            </Button>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSave}>Save</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RoleDialog;
