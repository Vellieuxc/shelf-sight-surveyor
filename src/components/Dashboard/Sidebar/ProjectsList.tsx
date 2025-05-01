
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Folder, FolderOpen } from "lucide-react";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
  activeProjectId?: string;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, isLoading, activeProjectId }) => {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const { profile } = useAuth();
  const isCrew = profile?.role === "crew";
  const isBoss = profile?.role === "boss";
  
  useEffect(() => {
    // For crew users, we need to filter projects to only show ones where they have stores
    // Boss users can see all projects
    const filterProjectsForUser = async () => {
      if (isBoss) {
        // Boss can see all projects
        setFilteredProjects(projects);
      } else if (isCrew && profile) {
        try {
          // Get all stores created by this crew user
          const { data: storesData, error: storesError } = await supabase
            .from("stores")
            .select("project_id")
            .eq("created_by", profile.id);
            
          if (storesError) throw storesError;
          
          // Extract unique project IDs
          const projectIds = [...new Set(storesData?.map(store => store.project_id) || [])];
          
          // Filter projects to only show those where the user has created stores
          setFilteredProjects(projects.filter(project => 
            projectIds.includes(project.id)
          ));
        } catch (error) {
          console.error("Error filtering projects for crew user:", error);
          setFilteredProjects([]); // Show no projects on error
        }
      } else {
        // For consultants and other roles, show all projects
        setFilteredProjects(projects);
      }
    };
    
    filterProjectsForUser();
  }, [projects, profile, isCrew, isBoss]);
  
  const isProjectActive = (projectId: string) => {
    return activeProjectId === projectId;
  };

  return (
    <ScrollArea className="h-[300px]">
      <SidebarMenu>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">No projects found</div>
        ) : (
          filteredProjects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton asChild isActive={isProjectActive(project.id)}>
                <Link to={`/dashboard/projects/${project.id}/stores`}>
                  {isProjectActive(project.id) ? <FolderOpen /> : <Folder />}
                  <span className="truncate">{project.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </ScrollArea>
  );
};

export default ProjectsList;
