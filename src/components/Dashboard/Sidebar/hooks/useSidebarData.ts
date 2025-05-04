
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { Project } from "@/types";
import { handleError } from "@/utils/errors";

export function useSidebarData() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!profile) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        setProjects(data || []);
      } catch (error: any) {
        handleError(error, {
          context: {
            source: 'database',
            operation: 'fetch projects',
            componentName: 'DashboardSidebar'
          },
          fallbackMessage: "Could not load projects"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [profile]);

  // Fetch current project by ID
  const fetchProjectById = async (projectId: string) => {
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
      handleError(error, {
        context: {
          source: 'database',
          operation: 'fetch project by id',
          componentName: 'DashboardSidebar'
        },
        fallbackMessage: "Could not load project details"
      });
      setCurrentProject(null);
    }
  };

  // Handle project expansion toggling
  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Handle project creation
  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  return {
    projects,
    isLoading,
    currentProject,
    expandedProjects,
    fetchProjectById,
    toggleProjectExpansion,
    handleProjectCreated
  };
}
