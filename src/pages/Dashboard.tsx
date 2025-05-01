
import React from "react";
import { Route, Routes, useParams, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";
import ProjectsList from "@/components/Dashboard/ProjectsList";
import StoresList from "@/components/Dashboard/StoresList";
import ImageAnalyzer from "@/components/Dashboard/ImageAnalyzer";
import StoreView from "@/components/Dashboard/StoreView";
import ProjectConnect from "@/components/Dashboard/ProjectConnect";
import { useAuth } from "@/contexts/AuthContext";

const StoresRoute = () => {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <Navigate to="/dashboard" />;
  return <StoresList projectId={projectId} />;
};

const StoreViewRoute = () => {
  const { storeId } = useParams<{ storeId: string }>();
  if (!storeId) return <Navigate to="/dashboard" />;
  return <StoreView storeId={storeId} />;
};

const AnalyzeRoute = () => {
  const { storeId } = useParams<{ storeId: string }>();
  if (!storeId) return <Navigate to="/dashboard" />;
  return <ImageAnalyzer storeId={storeId} />;
};

const DashboardContent = () => {
  const { profile } = useAuth();
  
  // For crew members, show the ProjectConnect component by default
  if (profile?.role === "crew") {
    return (
      <Routes>
        <Route index element={<ProjectConnect />} />
        <Route path="projects/:projectId/stores" element={<StoresRoute />} />
        <Route path="stores/:storeId" element={<StoreViewRoute />} />
        <Route path="stores/:storeId/analyze" element={<AnalyzeRoute />} />
      </Routes>
    );
  }
  
  // For consultants and other roles, show the regular dashboard
  return (
    <Routes>
      <Route index element={<ProjectsList />} />
      <Route path="projects/:projectId/stores" element={<StoresRoute />} />
      <Route path="stores/:storeId" element={<StoreViewRoute />} />
      <Route path="stores/:storeId/analyze" element={<AnalyzeRoute />} />
    </Routes>
  );
};

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <DashboardContent />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
