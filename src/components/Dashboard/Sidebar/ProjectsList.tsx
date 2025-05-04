
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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const isProjectActive = (projectId: string) => {
    return activeProjectId === projectId;
  };

  const handleClick = (projectId: string, e: React.MouseEvent) => {
    if (onProjectClick) {
      onProjectClick(projectId);
    }
  };

  // Calculate appropriate height based on device and number of projects
  const getHeight = () => {
    if (projects.length > 10) {
      return isMobile ? "200px" : "300px";
    }
    return "auto";
  };

  return (
    <ScrollArea className={`h-${getHeight()}`} style={{ height: getHeight() }}>
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
                <Link to={`/dashboard/projects/${project.id}/stores`} className="flex items-center truncate w-full">
                  <Folder size={18} />
                  <span className="truncate ml-2">{project.title}</span>
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
