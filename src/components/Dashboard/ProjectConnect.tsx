
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ProjectConnect: React.FC = () => {
  const [projectId, setProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId.trim()) {
      toast.error("Please enter a Project Connect ID");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to connect to a project");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the project exists
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, title")
        .eq("id", projectId)
        .maybeSingle();
        
      if (projectError) {
        toast.error("Error checking project: " + projectError.message);
        return;
      }
      
      if (!project) {
        toast.error("Project not found. Please check the ID and try again.");
        return;
      }
      
      // Check if the user is already a member of this project
      const { data: existingMembership, error: membershipError } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", project.id)
        .eq("user_id", user.id)
        .maybeSingle();
        
      if (membershipError) {
        toast.error("Error checking project membership: " + membershipError.message);
        return;
      }
      
      // If not already a member, add the user to the project
      if (!existingMembership) {
        const { error: addMemberError } = await supabase
          .from("project_members")
          .insert({
            project_id: project.id,
            user_id: user.id
          });
          
        if (addMemberError) {
          toast.error("Error joining project: " + addMemberError.message);
          return;
        }
        
        toast.success(`Successfully connected to project: ${project.title}`);
      } else {
        toast.success(`Connected to project: ${project.title}`);
      }
      
      // Navigate to the project
      navigate(`/dashboard/projects/${project.id}/stores`);
    } catch (error: any) {
      toast.error("Failed to connect to project: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Key className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Connect to Project</CardTitle>
              <CardDescription>
                Enter the Project Connect ID provided by your consultant
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleConnect}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="projectId" className="text-sm font-medium">
                  Project Connect ID
                </label>
                <Input
                  id="projectId"
                  placeholder="Enter project ID..."
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Connecting..." : "Connect to Project"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProjectConnect;
