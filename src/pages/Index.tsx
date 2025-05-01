
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, BarChart, FileSpreadsheet } from "lucide-react";
import MainLayout from "@/components/Layout/MainLayout";

const Index = () => {
  return (
    <MainLayout>
      <div className="page-container">
        <div className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Document Store Visits with AI-Powered Shelf Analysis
                  </h1>
                  <p className="text-gray-500 md:text-lg">
                    StoreVisitor helps field teams quickly capture and analyze retail shelf data using advanced AI. Get actionable insights in seconds.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/auth">
                    <Button className="flex-1" size="lg">
                      Get Started
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="flex-1">
                    Learn More
                  </Button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    <span className="text-sm text-gray-500">Fast Analysis</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-sm text-gray-500">AI-Powered</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 text-primary"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M7 7h10M7 12h10M7 17h10" />
                    </svg>
                    <span className="text-sm text-gray-500">Detailed Reports</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[450px] w-full overflow-hidden rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800"
                    alt="Store shelf with products"
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-6 text-white">
                    <h3 className="text-xl font-semibold">Retail shelf analytics</h3>
                    <p>Take control of your store visits with AI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-12 md:py-24 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Everything You Need for Store Visits
                </h2>
                <p className="text-gray-500 md:text-lg">
                  Streamline your field operations with powerful tools designed for retail audits
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Image Analysis</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Take pictures of store shelves and get instant AI analysis of products, brands, and pricing.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <BarChart className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Detailed Reports</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Generate comprehensive reports with SKU counts, pricing, promotional analysis, and shelf space utilization.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Excel Export</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Export all your data with one click for seamless integration with your existing systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
