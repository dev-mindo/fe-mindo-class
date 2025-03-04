import React from "react";
import { useTheme } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {  
  return (
    <div
      className='min-h-screen bg-background'      
    >
      {children}
    </div>
  );
}
