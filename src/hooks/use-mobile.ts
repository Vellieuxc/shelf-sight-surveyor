
import { useState, useEffect } from "react";

/**
 * Breakpoints for responsive design
 */
export enum Breakpoints {
  MOBILE = 640,
  TABLET = 768,
  DESKTOP = 1024,
  LARGE_DESKTOP = 1280
}

/**
 * Hook to detect if the current viewport is mobile size
 * 
 * @param breakpoint Optional custom breakpoint in pixels (default: 768)
 * @returns Boolean indicating if viewport is mobile size
 */
export function useIsMobile(breakpoint: number = Breakpoints.TABLET): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Add event listener
    window.addEventListener("resize", checkMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to detect current viewport size based on predefined breakpoints
 * @returns Object with boolean values for different device sizes
 */
export function useResponsive() {
  const [viewport, setViewport] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false,
    width: typeof window !== 'undefined' ? window.innerWidth : 0
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      setViewport({
        isMobile: width < Breakpoints.MOBILE,
        isTablet: width >= Breakpoints.MOBILE && width < Breakpoints.DESKTOP,
        isDesktop: width >= Breakpoints.DESKTOP && width < Breakpoints.LARGE_DESKTOP,
        isLargeDesktop: width >= Breakpoints.LARGE_DESKTOP,
        width: width
      });
    };

    // Initial check
    updateViewport();
    
    // Add event listener
    window.addEventListener('resize', updateViewport);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}
