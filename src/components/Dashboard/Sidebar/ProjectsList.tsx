
import React from "react";
import { Link } from "react-router-dom";
import { Folder, FolderOpen } from "lucide-react";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Project } from "@/types";

interface ProjectsListProps {
  projects: Project[];
  isLoading: boolean;
  activeProjectId?: string;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ projects, isLoading, activeProjectId }) => {
  
  const isProjectActive = (projectId: string) => {
    return activeProjectId === projectId;
  };

  return (
    <ScrollArea className="h-[300px]">
      <SidebarMenu>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">No projects found</div>
        ) : (
          projects.map((project) => (
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
