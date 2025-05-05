
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { DashboardSidebar } from "@/components/Dashboard/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile, useResponsive } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, showNav = true }) => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const isMobile = useIsMobile();
  const { isMobile: isSmallDevice } = useResponsive();
  const [openMobileMenu, setOpenMobileMenu] = useState(false);

  // Close mobile menu when switching between mobile and desktop
  useEffect(() => {
    setOpenMobileMenu(false);
  }, [isMobile]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-background flex flex-col w-full">
        {isAuthenticated ? (
          <div className="flex h-screen overflow-hidden">
            <DashboardSidebar />
            <main className="flex-1 overflow-auto relative pb-safe">
              {isMobile && (
                <div className="fixed top-4 left-4 z-40">
                  <SidebarTrigger>
                    <Button size="sm" variant="outline" className="h-10 w-10 p-0 shadow-sm">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </SidebarTrigger>
                </div>
              )}
              <div className={`p-3 sm:p-4 md:p-6 ${isMobile ? 'pt-16' : ''}`}>
                {children}
              </div>
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
                  
                  {/* Desktop navigation */}
                  <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/auth" className="bg-primary text-primary-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-md hover:bg-primary/90 transition-colors">
                      Sign In
                    </Link>
                  </nav>
                  
                  {/* Mobile navigation */}
                  {isSmallDevice ? (
                    <Sheet open={openMobileMenu} onOpenChange={setOpenMobileMenu}>
                      <SheetTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="md:hidden"
                          aria-label="Toggle mobile menu"
                        >
                          <Menu className="h-5 w-5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="p-0">
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b flex justify-between items-center">
                            <Link to="/" className="flex items-center space-x-2" onClick={() => setOpenMobileMenu(false)}>
                              <Camera className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-lg">StoreVisitor</span>
                            </Link>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Close menu">
                                <X className="h-5 w-5" />
                              </Button>
                            </SheetTrigger>
                          </div>
                          <div className="flex flex-col p-4 space-y-4">
                            <Link 
                              to="/dashboard" 
                              className="text-foreground hover:text-primary transition-colors py-2 text-lg"
                              onClick={() => setOpenMobileMenu(false)}
                            >
                              Dashboard
                            </Link>
                            <Link 
                              to="/auth" 
                              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-center"
                              onClick={() => setOpenMobileMenu(false)}
                            >
                              Sign In
                            </Link>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Drawer>
                      <DrawerTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="md:hidden"
                          aria-label="Toggle mobile menu"
                        >
                          <Menu className="h-5 w-5" />
                        </Button>
                      </DrawerTrigger>
                      <DrawerContent>
                        <div className="p-4 max-w-md mx-auto">
                          <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-medium">Menu</h2>
                            <DrawerClose asChild>
                              <Button variant="ghost" size="icon">
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                              </Button>
                            </DrawerClose>
                          </div>
                          <div className="space-y-4">
                            <Link to="/dashboard" className="block py-2 hover:text-primary">
                              Dashboard
                            </Link>
                            <Link to="/auth" className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex justify-center">
                              Sign In
                            </Link>
                          </div>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  )}
                </div>
              </header>
            )}
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-white border-t border-border py-4 safe-area-bottom">
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

export default MainLayout;
