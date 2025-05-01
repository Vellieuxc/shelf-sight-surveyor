
import React from "react";
import { Route, Routes, useParams, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";
import ProjectsList from "@/components/Dashboard/ProjectsList";
import StoresList from "@/components/Dashboard/StoresList";
import ImageAnalyzer from "@/components/Dashboard/ImageAnalyzer";

const StoresRoute = () => {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <Navigate to="/dashboard" />;
  return <StoresList projectId={projectId} />;
};

const AnalyzeRoute = () => {
  const { storeId } = useParams<{ storeId: string }>();
  if (!storeId) return <Navigate to="/dashboard" />;
  return <ImageAnalyzer storeId={storeId} />;
};

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Routes>
          <Route index element={<ProjectsList />} />
          <Route path="projects/:projectId/stores" element={<StoresRoute />} />
          <Route path="stores/:storeId/analyze" element={<AnalyzeRoute />} />
        </Routes>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
