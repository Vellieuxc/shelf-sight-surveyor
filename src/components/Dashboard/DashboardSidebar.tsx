
import React, { useState, useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";
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
import StoresList from "./Sidebar/StoresList";
import SidebarHeader from "./Sidebar/SidebarHeader";
import SidebarNavigation from "./Sidebar/SidebarNavigation";

export function DashboardSidebar() {
  const { signOut, profile } = useAuth();
  const location = useLocation();
  const { projectId, storeId } = useParams<{ projectId: string; storeId: string }>();
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

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

  // Fetch current project details if projectId is available
  useEffect(() => {
    const fetchCurrentProject = async () => {
      if (!projectId) {
        setCurrentProject(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("id", projectId)
          .single();
          
        if (error) throw error;
        setCurrentProject(data);
        
        // Auto-expand the current project
        if (data && !expandedProjects.includes(data.id)) {
          setExpandedProjects(prev => [...prev, data.id]);
        }
      } catch (error) {
        console.error("Error fetching current project:", error);
        setCurrentProject(null);
      }
    };
    
    fetchCurrentProject();
  }, [projectId]);

  const getActiveProjectId = () => {
    // First try to get from params
    if (projectId) return projectId;
    
    // Otherwise try to extract from path
    const match = location.pathname.match(/\/projects\/([^/]+)/);
    return match ? match[1] : undefined;
  };

  const getActiveStoreId = () => {
    // First try to get from params
    if (storeId) return storeId;
    
    // Otherwise try to extract from path
    const match = location.pathname.match(/\/stores\/([^/]+)/);
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

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
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
          <SidebarGroupLabel>Projects & Stores</SidebarGroupLabel>
          <SidebarGroupContent>
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">Loading projects...</div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="mb-2">
                  <ProjectsList 
                    projects={[project]} 
                    isLoading={false} 
                    activeProjectId={getActiveProjectId()}
                    onProjectClick={() => toggleProjectExpansion(project.id)}
                  />
                  {expandedProjects.includes(project.id) && (
                    <div className="ml-4 border-l border-sidebar-border pl-2 mt-1">
                      <StoresList 
                        projectId={project.id} 
                        activeStoreId={getActiveStoreId()} 
                      />
                    </div>
                  )}
                </div>
              ))
            )}
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
