
import React from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Shield, Ban, UserCheck } from "lucide-react";
import { UserData } from "./types";

interface UserActionsProps {
  user: UserData;
  openRoleDialog: (user: UserData) => void;
  openBlockDialog: (user: UserData) => void;
  isCurrentUser: boolean;
}

const UserActions: React.FC<UserActionsProps> = ({
  user,
  openRoleDialog,
  openBlockDialog,
  isCurrentUser,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => openRoleDialog(user)}
          disabled={user.role === "boss" && isCurrentUser}
        >
          <Shield className="mr-2 h-4 w-4" />
          Change Role
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => openBlockDialog(user)}
          disabled={user.role === "boss" || isCurrentUser}
          className={user.is_blocked ? "text-green-600" : "text-red-600"}
        >
          {user.is_blocked ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              Unblock User
            </>
          ) : (
            <>
              <Ban className="mr-2 h-4 w-4" />
              Block User
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
