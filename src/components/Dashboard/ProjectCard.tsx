
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, FolderX } from "lucide-react";
import { Project } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ProjectCardProps {
  project: Project;
  onProjectSelect?: (projectId: string) => void;
  onProjectStatusChange?: (projectId: string, isClosed: boolean) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onProjectSelect,
  onProjectStatusChange
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isConsultant = profile?.role === "consultant";
  
  const handleToggleProjectStatus = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ is_closed: !project.is_closed })
        .eq("id", project.id);
        
      if (error) throw error;
      
      toast.success(`Project ${project.is_closed ? "reopened" : "closed"} successfully!`);
      
      if (onProjectStatusChange) {
        onProjectStatusChange(project.id, !project.is_closed);
      }
    } catch (error: any) {
      toast.error(`Failed to update project status: ${error.message}`);
    }
  };
  
  const handleProjectClick = () => {
    if (onProjectSelect) {
      onProjectSelect(project.id);
    } else {
      navigate(`/dashboard/projects/${project.id}/stores`);
    }
  };

  return (
    <Card className={`card-shadow ${project.is_closed ? "opacity-80" : ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{project.title}</CardTitle>
          <Badge variant={project.is_closed ? "secondary" : "default"}>
            {project.is_closed ? "Closed" : "Active"}
          </Badge>
        </div>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <span>{project.category}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Country:</span>
            <span>{project.country}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Created:</span>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>
                {new Date(project.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={handleProjectClick}
          disabled={project.is_closed && !isConsultant}
        >
          {project.is_closed ? "View Details" : "Open Project"}
        </Button>
        
        {isConsultant && (
          <Button
            variant={project.is_closed ? "default" : "outline"}
            size="sm"
            className="w-full"
            onClick={handleToggleProjectStatus}
          >
            {project.is_closed ? (
              <><CheckCircle className="mr-2 h-4 w-4" /> Reopen Project</>
            ) : (
              <><FolderX className="mr-2 h-4 w-4" /> Close Project</>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
