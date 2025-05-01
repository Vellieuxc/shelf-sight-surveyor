
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
      // Use the connect_to_project database function to handle project connection
      const { data, error } = await supabase
        .rpc('connect_to_project', { 
          project_id_param: projectId 
        })
        .single();
        
      if (error) {
        toast.error("Error connecting to project: " + error.message);
        return;
      }
      
      if (!data || !data.project_id) {
        toast.error("Project not found. Please check the ID and try again.");
        return;
      }
      
      if (data.already_member) {
        toast.success(`Connected to project: ${data.project_title}`);
      } else {
        toast.success(`Successfully connected to project: ${data.project_title}`);
      }
      
      // Navigate to the project
      navigate(`/dashboard/projects/${data.project_id}/stores`);
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
