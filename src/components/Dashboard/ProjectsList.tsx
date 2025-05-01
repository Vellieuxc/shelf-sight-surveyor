
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Project } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import ProjectCard from "./ProjectCard";
import NewProjectDialog from "./NewProjectDialog";
import EmptyProjectsState from "./EmptyProjectsState";

interface ProjectsListProps {
  onProjectSelect?: (projectId: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onProjectSelect }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;

      setProjects(data || []);
    } catch (error: any) {
      toast.error("Error loading projects: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    
    // Optionally navigate to the new project if onProjectSelect isn't provided
    if (!onProjectSelect) {
      navigate(`/dashboard/projects/${newProject.id}/stores`);
    }
  };
  
  const handleProjectStatusChange = (projectId: string, isClosed: boolean) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, is_closed: isClosed } 
        : project
    ));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button className="flex items-center gap-2" onClick={() => setIsNewProjectDialogOpen(true)}>
          <Plus size={16} />
          <span>New Project</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : projects.length === 0 ? (
        <EmptyProjectsState onCreateClick={() => setIsNewProjectDialogOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project}
              onProjectSelect={onProjectSelect}
              onProjectStatusChange={handleProjectStatusChange}
            />
          ))}
        </div>
      )}
      
      <NewProjectDialog 
        open={isNewProjectDialogOpen}
        onOpenChange={setIsNewProjectDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
};

export default ProjectsList;
