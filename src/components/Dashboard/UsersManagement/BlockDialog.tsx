
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
import { UserData } from "./types";

interface BlockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedUser: UserData | null;
  onConfirm: () => Promise<void>;
}

const BlockDialog: React.FC<BlockDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedUser,
  onConfirm
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {selectedUser?.is_blocked ? "Unblock User" : "Block User"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {selectedUser?.is_blocked 
              ? `Are you sure you want to unblock ${selectedUser?.email}? They will be able to login and use the system again.`
              : `Are you sure you want to block ${selectedUser?.email}? They will not be able to login or use the system.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={selectedUser?.is_blocked ? "" : "bg-red-600 hover:bg-red-700"}
          >
            {selectedUser?.is_blocked ? "Unblock" : "Block"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BlockDialog;
