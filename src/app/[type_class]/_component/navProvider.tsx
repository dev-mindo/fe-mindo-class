"use client";
import { clearCachesByServerAction } from "@/lib/action/quiz";
import { usePathname } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface NavContextType {
  hideSidebar: boolean;
  hideAll: boolean;
  setHideSidebar: (isHide: boolean) => void;
  setHideAll: (isHide: boolean) => void;
}

const NavContext = createContext<NavContextType | undefined>(undefined);

export const NavProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname()
  const [hideSidebar, setHideSidebar] = useState<boolean>(false);
  const [hideAll, setHideAll] = useState<boolean>(false); 
  const [loading, setLoading] = useState<boolean>(true)

  const urlPath = new RegExp(
    /(\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/quiz\/[^/?]+|\/evaluation\/[^/]+)$/
  );  

  useEffect(() => {
    console.log('change pathname ', pathname)
    if(pathname.match(urlPath)){
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
        setHideSidebar,
        setHideAll,
      }}
    >
      {children}
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
