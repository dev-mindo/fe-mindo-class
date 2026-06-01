"use client"
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDashboardContext } from "@/context/DashboardContext";
import { LogOut, Menu, User } from "lucide-react";
import { useEffect, useState } from "react";

export function AppTopBar() {
    const {titleTopBar, setHideSidebar, hideSidebar} = useDashboardContext()
    const [profile, setProfile] = useState({
      name: "",
      role: "",
      username: "",
    });

    const hideSidebarHandler = () => {
        setHideSidebar(!hideSidebar)
    }

    useEffect(() => {
      setProfile({
        name: localStorage.getItem("name") || "Profile",
        role: localStorage.getItem("role") || "",
        username: localStorage.getItem("username") || "",
      });
    }, []);

    const logoutHandler = () => {
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("username");
      document.cookie = "admin_auth_token=; Max-Age=0; path=/";
      document.cookie = "admin_refresh_token=; Max-Age=0; path=/";
      window.location.href = "/dashboard/login";
    };

  return (
    <div className="flex items-center justify-between gap-3 bg-sidebar w-full p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Button onClick={hideSidebarHandler} type="button" variant="ghost" size="icon">
          <Menu />
        </Button>
        <div className="min-w-0">
          <h3 className="truncate font-medium">
            {titleTopBar || "Dashboard"}
          </h3>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" type="button" className="rounded-full">
              <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{profile.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {profile.role || profile.username}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logoutHandler} className="cursor-pointer text-red-600 focus:text-red-600">
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
