
import React from "react";
import AuthForm from "@/components/Auth/AuthForm";
import MainLayout from "@/components/Layout/MainLayout";

const Auth = () => {
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
