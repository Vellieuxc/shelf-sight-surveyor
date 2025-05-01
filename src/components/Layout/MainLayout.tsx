
import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showNav = true }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen bg-background flex flex-col w-full">
        {isAuthenticated ? (
          <div className="flex h-screen">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        ) : (
          <>
            {showNav && (
              <header className="bg-white border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                  <Link to="/" className="flex items-center space-x-2">
                    <Camera className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-xl">StoreVisitor</span>
                  </Link>
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/auth" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                      Sign In
                    </Link>
                  </nav>
                  <button className="md:hidden p-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </header>
            )}
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-border py-4">
              <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} StoreVisitor. All rights reserved.
              </div>
            </footer>
          </>
        )}
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
