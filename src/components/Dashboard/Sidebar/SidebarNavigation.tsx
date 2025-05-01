
import React from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Users } from "lucide-react";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";

interface SidebarNavigationProps {
  location: { pathname: string };
  isBoss: boolean;
  isCrewMember: boolean;
  onNewProjectClick: () => void;
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ 
  location, 
  isBoss, 
  isCrewMember,
  onNewProjectClick
}) => {
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
          <Link to="/dashboard">
            <LayoutDashboard />
            <span>Dashboard</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      
      {/* Show Users Management link only for Boss users */}
      {isBoss && (
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={isActive("/dashboard/users")}>
            <Link to="/dashboard/users">
              <Users />
              <span>Users</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
      
      {/* Only show New Project button if not a crew member or is a boss */}
      {(!isCrewMember || isBoss) && (
        <SidebarMenuItem>
          <SidebarMenuButton 
            tooltip="Create New Project" 
            onClick={onNewProjectClick}
          >
            <PlusCircle />
            <span>New Project</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
};

export default SidebarNavigation;
