
import React, { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import ProjectsList from "@/components/Dashboard/ProjectsList";
import StoresList from "@/components/Dashboard/StoresList";
import ImageAnalyzer from "@/components/Dashboard/ImageAnalyzer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from "@/types";

// Mock user with Crew role for UI demonstration
const mockUser = {
  id: "user123",
  email: "user@example.com",
  role: UserRole.CREW,
  firstName: "John",
  lastName: "Doe"
};

const Dashboard = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedStoreId(null);
  };
  
  const handleStoreSelect = (storeId: string) => {
    setSelectedStoreId(storeId);
  };
  
  const handleBack = () => {
    if (selectedStoreId) {
      setSelectedStoreId(null);
    } else if (selectedProjectId) {
      setSelectedProjectId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">StoreVisitor</h1>
            <span className="text-sm text-muted-foreground">
              | {mockUser.role.charAt(0).toUpperCase() + mockUser.role.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{mockUser.firstName} {mockUser.lastName}</span>
            <Button variant="outline" size="sm">Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {(selectedProjectId || selectedStoreId) && (
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={handleBack}
          >
            ← Back
          </Button>
        )}

        {!selectedProjectId && !selectedStoreId && (
          <Tabs defaultValue="projects" className="mb-8">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>
            <TabsContent value="projects" className="mt-6">
              <ProjectsList onProjectSelect={handleProjectSelect} />
            </TabsContent>
            <TabsContent value="metrics" className="mt-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Your Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-6 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Stores Created</h3>
                    <p className="text-3xl font-bold mt-2">2</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Pictures Uploaded</h3>
                    <p className="text-3xl font-bold mt-2">8</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Images Analyzed</h3>
                    <p className="text-3xl font-bold mt-2">5</p>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-md">
                    <h3 className="text-lg font-medium text-gray-900">Active Projects</h3>
                    <p className="text-3xl font-bold mt-2">1</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {selectedProjectId && !selectedStoreId && (
          <StoresList projectId={selectedProjectId} onStoreSelect={handleStoreSelect} />
        )}
        
        {selectedProjectId && selectedStoreId && (
          <ImageAnalyzer storeId={selectedStoreId} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
