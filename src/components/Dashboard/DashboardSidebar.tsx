
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import UserProfile from "../Auth/UserProfile";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import NewProjectDialog from "./Sidebar/NewProjectDialog";
import ProjectsList from "./Sidebar/ProjectsList";
import SidebarHeader from "./Sidebar/SidebarHeader";
import SidebarNavigation from "./Sidebar/SidebarNavigation";

export function DashboardSidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!profile) return;
      
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
  }, [profile]);

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
  
  const handleNewProjectClick = () => {
    setIsNewProjectDialogOpen(true);
  };

  return (
    <Sidebar>
      <SidebarHeader />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNavigation 
              location={location} 
              isBoss={isBoss} 
              isCrewMember={isCrewMember}
              onNewProjectClick={handleNewProjectClick}
            />
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
