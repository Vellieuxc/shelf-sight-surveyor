
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/Auth/AuthForm";
import MainLayout from "@/components/Layout/MainLayout";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <MainLayout showNav={false}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout showNav={false}>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">StoreVisitor</h1>
            <p className="mt-2 text-gray-600">
              Sign in or create an account to get started
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </MainLayout>
  );
};

export default Auth;
