
import { useState, useEffect } from "react";

/**
 * Hook to detect if the current viewport is mobile size
 * 
 * @param breakpoint Optional custom breakpoint in pixels (default: 768)
 * @returns Boolean indicating if viewport is mobile size
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    
    // Set initial value
    checkMobile();
    
    // Add event listener
    window.addEventListener("resize", checkMobile);
    
    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
