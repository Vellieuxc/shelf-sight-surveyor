
import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { LogOut, LayoutDashboard, PlusCircle, Users } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import UserProfile from "../Auth/UserProfile";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import NewProjectDialog from "./Sidebar/NewProjectDialog";
import ProjectsList from "./Sidebar/ProjectsList";
import SidebarHeader from "./Sidebar/SidebarHeader";

export function DashboardSidebar() {
  const { signOut, user, profile } = useAuth();
  const location = useLocation();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setProjects(data || []);
      } catch (error: any) {
        console.error("Error fetching projects:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const getActiveProjectId = () => {
    const match = location.pathname.match(/\/projects\/([^/]+)/);
    return match ? match[1] : undefined;
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  // Check user roles
  const isCrewMember = profile?.role === "crew";
  const isBoss = profile?.role === "boss";

  return (
    <Sidebar>
      <SidebarHeader />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
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
                    onClick={() => setIsNewProjectDialogOpen(true)}
                  >
                    <PlusCircle />
                    <span>New Project</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <ProjectsList 
              projects={projects} 
              isLoading={isLoading} 
              activeProjectId={getActiveProjectId()} 
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4 space-y-4">
        <UserProfile />
        <Button 
          variant="outline" 
          className="w-full flex gap-2 text-destructive hover:text-destructive-foreground hover:bg-destructive"
          onClick={signOut}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </Button>
      </SidebarFooter>

      <NewProjectDialog 
        open={isNewProjectDialogOpen} 
        onOpenChange={setIsNewProjectDialogOpen} 
        onProjectCreated={handleProjectCreated}
      />
    </Sidebar>
  );
}

export default DashboardSidebar;
