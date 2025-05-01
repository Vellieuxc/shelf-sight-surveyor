
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar } from "lucide-react";
import { Project } from "@/types";

// Dummy data for projects
const dummyProjects: Project[] = [
  {
    id: "1",
    title: "Grocery Store Audit",
    description: "Monthly audit of grocery stores in the northeastern region",
    category: "Retail",
    country: "United States",
    created_by: "user123",
    created_at: "2025-04-15T10:30:00Z",
    is_closed: false,
  },
  {
    id: "2",
    title: "Convenience Store Check",
    description: "Quarterly review of convenience store shelves",
    category: "Retail",
    country: "Canada",
    created_by: "user123",
    created_at: "2025-04-10T14:15:00Z",
    is_closed: true,
  }
];

interface ProjectsListProps {
  onProjectSelect?: (projectId: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({ onProjectSelect }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Button className="flex items-center gap-2">
          <Plus size={16} />
          <span>New Project</span>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dummyProjects.map((project) => (
          <Card key={project.id} className={`card-shadow ${project.is_closed ? "opacity-80" : ""}`}>
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
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => onProjectSelect && onProjectSelect(project.id)}
                disabled={project.is_closed}
              >
                {project.is_closed ? "View Details" : "Open Project"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;
