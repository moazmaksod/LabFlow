
"use client"
import * as React from "react"

const MOBILE_BREAKPOINT = 768

// Function to get the value safely on client side
const getIsMobile = () => {
    if (typeof window === "undefined") {
        return undefined;
    }
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
}


export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(getIsMobile());

  React.useEffect(() => {
    // Handler to call on window resize
    const handleResize = () => {
      setIsMobile(getIsMobile());
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Call handler right away so state is updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return isMobile
}
