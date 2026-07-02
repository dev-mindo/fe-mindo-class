"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  DashboardUser,
  useDashboardContext,
} from "@/context/DashboardContext";
import { canAccessDashboardPath } from "@/lib/dashboard-permissions";
import type { ApiResponse } from "@/lib/utils/fetchApi";

const LOGIN_PATH = "/dashboard/login";

type ProfileResponse = DashboardUser | { user: DashboardUser };

export function DashboardSessionGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setUser } = useDashboardContext();
  const [isChecking, setIsChecking] = useState(pathname !== LOGIN_PATH);

  useEffect(() => {
    if (pathname === LOGIN_PATH) {
      setUser(null);
      setIsChecking(false);
      return;
    }

    let isActive = true;

    const logout = async () => {
      localStorage.removeItem("name");
      localStorage.removeItem("role");
      localStorage.removeItem("username");

      try {
        await fetch("/api/admin-set-token", { method: "DELETE" });
      } finally {
        window.location.replace(LOGIN_PATH);
      }
    };

    const validateProfile = async () => {
      setIsChecking(true);

      try {
        const profileResponse = await fetch("/api/admin-profile", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const response: ApiResponse<ProfileResponse> =
          await profileResponse.json();

        if (!isActive) {
          return;
        }

        if (response.statusCode !== 200 || !response.data) {
          console.error("[dashboard-session] Profile invalid", response);
          await logout();
          return;
        }

        const profile =
          "user" in response.data ? response.data.user : response.data;

        if (!profile.name || !profile.role) {
          console.error("[dashboard-session] Profile missing name or role", profile);
          await logout();
          return;
        }

        if (!canAccessDashboardPath(profile.role, pathname)) {
          window.location.replace("/dashboard");
          return;
        }

        setUser(profile);
        localStorage.setItem("name", profile.name);
        localStorage.setItem("role", profile.role);
        if (profile.username) {
          localStorage.setItem("username", profile.username);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("[dashboard-session] Profile check failed", error);
        await logout();
        return;
      }

      if (isActive) {
        setIsChecking(false);
      }
    };

    void validateProfile();

    return () => {
      isActive = false;
    };
  }, [pathname, setUser]);

  if (pathname !== LOGIN_PATH && isChecking) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Memeriksa sesi...
        </div>
      </div>
    );
  }

  return children;
}
