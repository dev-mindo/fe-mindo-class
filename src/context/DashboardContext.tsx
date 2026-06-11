// src/context/AppContext.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export type DashboardUser = {
  id: number | string;
  name: string;
  email?: string;
  username?: string;
  role: string;
};

type AppContextType = {
  user: DashboardUser | null;
  setUser: (user: DashboardUser | null) => void;
  isLoggedIn: boolean;
  hideSidebar: boolean;
  setHideSidebar: (hideSidebar: boolean) => void;
  titleTopBar: string
  setTitleTopBar: (title: string) => void
};

const DashboardContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export function DashboardProvider({ children }: AppProviderProps) {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [hideSidebar, setHideSidebar] = useState<boolean>(false)
  const [titleTopBar, setTitleTopBar] = useState<string>("")

  const value: AppContextType = {
    user,
    setUser,
    hideSidebar,
    setHideSidebar,
    titleTopBar,
    setTitleTopBar,
    isLoggedIn: !!user,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardContext() {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useAppContext harus digunakan di dalam AppProvider");
  }

  return context;
}
