
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, FolderX, Store as StoreIcon, Image, Key, User } from "lucide-react";
import { Project } from "@/types";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

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
  const [storeCount, setStoreCount] = useState<number | null>(null);
  const [pictureCount, setPictureCount] = useState<number | null>(null);
  const [creatorName, setCreatorName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchProjectStats = async () => {
      setIsLoading(true);
      try {
        // Fetch store count
        const { count: storesCount, error: storesError } = await supabase
          .from("stores")
          .select("id", { count: 'exact' })
          .eq("project_id", project.id);
          
        if (storesError) throw storesError;
        setStoreCount(storesCount);
        
        // Fetch pictures count linked to this project's stores
        const { data: stores, error: storesListError } = await supabase
          .from("stores")
          .select("id")
          .eq("project_id", project.id);
          
        if (storesListError) throw storesListError;
        
        if (stores && stores.length > 0) {
          const storeIds = stores.map(store => store.id);
          const { count: photosCount, error: photosError } = await supabase
            .from("pictures")
            .select("id", { count: 'exact' })
            .in("store_id", storeIds);
            
          if (photosError) throw photosError;
          setPictureCount(photosCount);
        } else {
          setPictureCount(0);
        }
        
        // Fetch creator name
        const { data: creatorData, error: creatorError } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", project.created_by)
          .single();
          
        if (!creatorError && creatorData) {
          if (creatorData.first_name && creatorData.last_name) {
            setCreatorName(`${creatorData.first_name} ${creatorData.last_name}`);
          } else {
            setCreatorName(creatorData.email);
          }
        }
      } catch (error: any) {
        console.error("Error fetching project stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjectStats();
  }, [project.id, project.created_by]);
  
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
  
  const formattedDate = format(new Date(project.created_at), "PPP");

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
          
          {/* Creator and Creation Date */}
          <div className="pt-2 border-t mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <User size={14} />
                <span>Created by:</span>
              </span>
              <span>{creatorName || "Unknown"}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Calendar size={14} />
                <span>Created on:</span>
              </span>
              <span title={formattedDate}>
                {formattedDate}
              </span>
            </div>
          </div>
          
          {/* Project Statistics */}
          <div className="pt-2 border-t mt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <StoreIcon size={14} />
                <span>Stores:</span>
              </span>
              <span>{isLoading ? '...' : storeCount !== null ? storeCount : '-'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Image size={14} />
                <span>Pictures:</span>
              </span>
              <span>{isLoading ? '...' : pictureCount !== null ? pictureCount : '-'}</span>
            </div>
          </div>
          
          {/* Project Connect ID - Only for Consultants */}
          {isConsultant && (
            <div className="mt-3 pt-2 border-t border-dashed">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Key size={14} />
                  <span>Project Connect ID:</span>
                </span>
              </div>
              <p className="text-xs font-mono bg-muted p-1 rounded mt-1 select-all">{project.id}</p>
              <p className="text-xs text-muted-foreground mt-1">Share this ID with crew members to connect</p>
            </div>
          )}
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
