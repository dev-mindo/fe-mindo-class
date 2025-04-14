"use client";
import { clearCachesByServerAction } from "@/lib/action/quiz";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface NavContextType {
  hideSidebar: boolean;
  hideAll: boolean;
  hidePagination: boolean;
  setHideSidebar: (isHide: boolean) => void;
  setHideAll: (isHide: boolean) => void;
  setHidePagination: (isHide: boolean) => void
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const size: {
    width: number | undefined,
    height: number | undefined
  } = useWindowSize();
  const pathname = usePathname()
  const [hideSidebar, setHideSidebar] = useState<boolean>(true);
  const [hideAll, setHideAll] = useState<boolean>(false); 
  const [loading, setLoading] = useState<boolean>(true)  
  const [hidePagination, setHidePagination] = useState<boolean>(false)

  const urlPathQuiz = new RegExp(
    /(\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/quiz\/[^/?]+|\/evaluation\/[^/]+)$/
  );

  const urlPathEvaluation = new RegExp(
    /(\/[^/]+\/[^/]+\/[^/]+\/evaluation\/feedback-form\/\d+)$/
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if(size.width && size.width >= 1024){        
        setHidePagination(false)
      }else{              
        setHidePagination(true)
      }
      
      if(size.width && size.width >= 1280){
        setHideSidebar(false)
      }else{    
        setHideSidebar(true)      
      }
    }
  }, [size])

  useEffect(() => {
    console.log('change pathname ', pathname)
    if(pathname.match(urlPathQuiz) || pathname.match(urlPathEvaluation)){
      setHideAll(true)      
    }else{
      setHideAll(false)
    }
    setLoading(false)
  }, [pathname])

  if(loading){
    return <></>
  }
  

  return (
    <NavContext.Provider
      value={{
        hideSidebar,
        hideAll,
        hidePagination,
        setHideSidebar,
        setHideAll,
        setHidePagination
      }}
    >
      <div className={size.width && size.width >= 1024 ? "flex" : ''}>
        {children}
      </div>      
    </NavContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(NavContext);
  if (!context) {
    throw new Error("useAppContext harus digunakan dalam AppProvider");
  }
  return context;
};

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<{
    width: number | undefined,
    height: number | undefined
  }>({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    // only execute all the code below in client side
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    
    // Add event listener
    window.addEventListener("resize", handleResize);
     
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}