
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import UserActions from "./UserActions";
import { UserData } from "./types";

interface UsersListProps {
  users: UserData[];
  isLoading: boolean;
  openRoleDialog: (user: UserData) => void;
  openBlockDialog: (user: UserData) => void;
  currentUserId: string | undefined;
}

const UsersList: React.FC<UsersListProps> = ({
  users,
  isLoading,
  openRoleDialog,
  openBlockDialog,
  currentUserId,
}) => {
  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>
          {isLoading 
            ? "Loading users..." 
            : `A list of all users (${users.length})`}
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">Loading users data...</TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">No users found</TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>
                  {user.first_name && user.last_name 
                    ? `${user.first_name} ${user.last_name}`
                    : "-"
                  }
                </TableCell>
                <TableCell>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === "boss" 
                      ? "bg-red-100 text-red-800" 
                      : user.role === "consultant" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                  }`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </TableCell>
                <TableCell>
                  {user.is_blocked ? (
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
                      Blocked
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <UserActions 
                    user={user}
                    openRoleDialog={openRoleDialog}
                    openBlockDialog={openBlockDialog}
                    isCurrentUser={user.id === currentUserId}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersList;
