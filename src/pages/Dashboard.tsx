
import React from "react";
import { Route, Routes, useParams, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import MainLayout from "@/components/Layout/MainLayout";
import ProjectsList from "@/components/Dashboard/ProjectsList";
import StoresList from "@/components/Dashboard/StoresList";
import ImageAnalyzer from "@/components/Dashboard/ImageAnalyzer";
import StoreViewContainer from "@/components/Dashboard/StoreView/StoreViewContainer";
import ProjectConnect from "@/components/Dashboard/ProjectConnect";
import UsersManagement from "@/components/Dashboard/UsersManagement";
import { useAuth } from "@/contexts/auth";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const StoresRoute = () => {
  const { projectId } = useParams<{ projectId: string }>();
  if (!projectId) return <Navigate to="/dashboard" />;
  return (
    <ErrorBoundary>
      <StoresList projectId={projectId} />
    </ErrorBoundary>
  );
};

const AnalyzeRoute = () => {
  const { storeId } = useParams<{ storeId: string }>();
  if (!storeId) return <Navigate to="/dashboard" />;
  return (
    <ErrorBoundary>
      <ImageAnalyzer storeId={storeId} />
    </ErrorBoundary>
  );
};

const StoreViewRoute = () => {
  const { storeId } = useParams<{ storeId: string }>();
  if (!storeId) return <Navigate to="/dashboard" />;
  return (
    <ErrorBoundary>
      <StoreViewContainer storeId={storeId} />
    </ErrorBoundary>
  );
};

const DashboardContent = () => {
  const { profile } = useAuth();
  const isBoss = profile?.role === "boss";
  const isCrew = profile?.role === "crew";
  
  // For crew members, show the ProjectConnect component by default
  if (isCrew && !isBoss) {
    return (
      <Routes>
        <Route index element={<ProjectConnect />} />
        <Route path="projects/:projectId/stores" element={<StoresRoute />} />
        <Route path="stores/:storeId" element={<StoreViewRoute />} />
        <Route path="stores/:storeId/analyze" element={<AnalyzeRoute />} />
      </Routes>
    );
  }
  
  // For boss users, include access to the users management page
  if (isBoss) {
    return (
      <Routes>
        <Route index element={<ErrorBoundary><ProjectsList /></ErrorBoundary>} />
        <Route path="projects/:projectId/stores" element={<StoresRoute />} />
        <Route path="stores/:storeId" element={<StoreViewRoute />} />
        <Route path="stores/:storeId/analyze" element={<AnalyzeRoute />} />
        <Route path="users" element={<ErrorBoundary><UsersManagement /></ErrorBoundary>} />
      </Routes>
    );
  }
  
  // For consultants and other roles, show the regular dashboard
  return (
    <Routes>
      <Route index element={<ErrorBoundary><ProjectsList /></ErrorBoundary>} />
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
