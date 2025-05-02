
import React from "react";
import { Link } from "react-router-dom";
import { Camera, Menu } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showNav = true }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-background flex flex-col w-full">
        {isAuthenticated ? (
          <div className="flex h-screen">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto relative">
              {isMobile && (
                <div className="absolute top-4 left-4 z-10">
                  <SidebarTrigger>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Menu className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SidebarTrigger>
                </div>
              )}
              {children}
            </main>
          </div>
        ) : (
          <>
            {showNav && (
              <header className="bg-white border-b border-border">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                  <Link to="/" className="flex items-center space-x-2">
                    <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <span className="font-semibold text-lg sm:text-xl">StoreVisitor</span>
                  </Link>
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/auth" className="bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-primary/90 transition-colors">
                      Sign In
                    </Link>
                  </nav>
                  <MobileMenu />
                </div>
              </header>
            )}
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-border py-4">
              <div className="container mx-auto px-4 text-center text-xs sm:text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} StoreVisitor. All rights reserved.
              </div>
            </footer>
          </>
        )}
      </div>
    </SidebarProvider>
  );
};

// Mobile menu component for non-authenticated users
const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="md:hidden">
      <button 
        className="p-2" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle mobile menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-border z-40 shadow-md">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
            <Link 
              to="/dashboard" 
              className="text-foreground hover:text-primary transition-colors py-2"
              onClick={() => setIsOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/auth" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

// Button component for the mobile sidebar trigger
const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "outline";
    size?: "default" | "sm";
  }
>(({ className, variant = "default", size = "default", ...props }, ref) => {
  const sizeClasses = size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm";
  const variantClasses = 
    variant === "outline" 
      ? "border border-input bg-background hover:bg-accent hover:text-accent-foreground" 
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  
  return (
    <button
      ref={ref}
      className={`${sizeClasses} ${variantClasses} inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${className || ''}`}
      {...props}
    />
  );
});
Button.displayName = "Button";

export default MainLayout;
