
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Shield, MoreHorizontal, Search, Ban, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { UserRole } from "@/types";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  is_blocked?: boolean;
  first_name?: string;
  last_name?: string;
}

const UsersManagement = () => {
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
  useEffect(() => {
    const fetchUsers = async () => {
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
    };

    fetchUsers();
  }, [profile]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role: selectedRole })
        .eq("id", selectedUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: selectedRole } 
          : user
      ));
      
      toast.success(`Changed ${selectedUser.email}'s role to ${selectedRole}`);
    } catch (error: any) {
      console.error("Error updating user role:", error.message);
      toast.error("Failed to update user role");
    } finally {
      // Make sure dialog is closed after operation finishes
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
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, is_blocked: newBlockedStatus } 
          : user
      ));
      
      toast.success(
        newBlockedStatus 
          ? `Blocked user ${selectedUser.email}` 
          : `Unblocked user ${selectedUser.email}`
      );
    } catch (error: any) {
      console.error("Error updating user blocked status:", error.message);
      toast.error("Failed to update user status");
    } finally {
      // Make sure dialog is closed after operation finishes 
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

  return (
    <div className="container px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          User Management
        </h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-9"
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableCaption>
            {isLoading 
              ? "Loading users..." 
              : `A list of all users (${filteredUsers.length})`}
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
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">No users found</TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
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
                          disabled={user.role === "boss" && user.id === profile?.id}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openBlockDialog(user)}
                          disabled={user.role === "boss" || user.id === profile?.id}
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Role Change Dialog */}
      <AlertDialog open={showRoleDialog} onOpenChange={(open) => {
        setShowRoleDialog(open);
        if (!open) setSelectedUser(null);
      }}>
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
            <AlertDialogAction onClick={handleRoleChange}>Save</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Block User Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={(open) => {
        setShowBlockDialog(open);
        if (!open) setSelectedUser(null);
      }}>
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
              onClick={handleToggleBlockUser}
              className={selectedUser?.is_blocked ? "" : "bg-red-600 hover:bg-red-700"}
            >
              {selectedUser?.is_blocked ? "Unblock" : "Block"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersManagement;
