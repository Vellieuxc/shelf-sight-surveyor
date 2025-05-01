
import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";
import ProjectsList from "@/components/Dashboard/ProjectsList";
import StoresList from "@/components/Dashboard/StoresList";
import ImageAnalyzer from "@/components/Dashboard/ImageAnalyzer";

const Dashboard = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Routes>
          <Route index element={<ProjectsList />} />
          <Route path="projects/:projectId/stores" element={<StoresList />} />
          <Route path="stores/:storeId/analyze" element={<ImageAnalyzer />} />
        </Routes>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
