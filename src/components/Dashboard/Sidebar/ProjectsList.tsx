
import React from "react";
import { Link } from "react-router-dom";
import { Folder } from "lucide-react";
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
  onProjectClick?: (projectId: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ 
  projects, 
  isLoading, 
  activeProjectId,
  onProjectClick
}) => {
  const isProjectActive = (projectId: string) => {
    return activeProjectId === projectId;
  };

  const handleClick = (projectId: string, e: React.MouseEvent) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

  return (
    <ScrollArea className={projects.length > 10 ? "h-[300px]" : "h-auto"}>
      <SidebarMenu>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading projects...</div>
        ) : projects.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">No projects</div>
        ) : (
          projects.map((project) => (
            <SidebarMenuItem key={project.id}>
              <SidebarMenuButton 
                asChild 
                isActive={isProjectActive(project.id)}
                onClick={(e) => handleClick(project.id, e as React.MouseEvent)}
              >
                <Link to={`/dashboard/projects/${project.id}/stores`}>
                  <Folder size={18} />
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
