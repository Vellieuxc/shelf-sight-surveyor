
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProjectConnect: React.FC = () => {
  const [projectId, setProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectId.trim()) {
      toast.error("Please enter a Project Connect ID");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Check if the project exists
      const { data, error } = await supabase
        .from("projects")
        .select("id, title")
        .eq("id", projectId)
        .single();
        
      if (error) {
        if (error.code === "PGRST116") {
          toast.error("Project not found. Please check the ID and try again.");
        } else {
          toast.error("Error connecting to project: " + error.message);
        }
        return;
      }
      
      if (data) {
        toast.success(`Connected to project: ${data.title}`);
        navigate(`/dashboard/projects/${data.id}/stores`);
      }
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
                <p className="text-xs text-muted-foreground">
                  The ID looks like: 123e4567-e89b-12d3-a456-426614174000
                </p>
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
