"use client";
import {
  ArrowLeftFromLine,
  ClipboardList,
  FileText,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  Loader2,
  Menu,
  MessageSquareText,
  MonitorPlay,
  Moon,
  SquareMenu,
  SquareUserRound,
  Sun,
  TvMinimalPlay,
  User,
  Users,
  X,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAppContext } from "@/app/[type_class]/_component/navProvider";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useDashboardContext } from "@/context/DashboardContext";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: <LayoutDashboard strokeWidth={1.5} size={20} />,
  },
  {
    title: "Kelas",
    url: "/dashboard/classroom",
    icon: <SquareUserRound strokeWidth={1.5} size={20} />,
  },
  {
    title: "Modul",
    url: "/dashboard/module",
    icon: <SquareMenu strokeWidth={1.5} size={20} />,
  },
  {
    title: "Peserta",
    url: "/dashboard/list-participant",
    icon: <Users strokeWidth={1.5} size={20} />,
  },
  {
    title: "Kuis",
    url: "/dashboard/quiz",
    icon: <ClipboardList strokeWidth={1.5} size={20} />,
  },
  {
    title: "Tugas",
    url: "/dashboard/task",
    icon: <FileText strokeWidth={1.5} size={20} />,
  },
  {
    title: "Video",
    url: "/dashboard/video",
    icon: <MonitorPlay strokeWidth={1.5} size={20} />,
  },
  {
    title: "Diskusi",
    url: "/dashboard/discussion",
    icon: <MessageSquareText strokeWidth={1.5} size={20} />,
  },
  {
    title: "Pengguna",
    url: "/dashboard/user",
    icon: <User strokeWidth={1.5} size={20} />,
  },
  {
    title: "Instruktur",
    url: "/dashboard/instructor",
    icon: <GraduationCap strokeWidth={1.5} size={20} />,
  },
];

const menu = [
  {
    title: "Logout",
    icon: <ArrowLeftFromLine strokeWidth={1.5} size={20} />,
    url: process.env.NEXT_PUBLIC_MINDO_MY_CLASS,
  },
];

const isActiveMenu = (pathname: string, url: string) => {
  if (url === "/dashboard") {
    return pathname === url;
  }

  return pathname === url || pathname.startsWith(`${url}/`);
};

export function AppSidebar() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);
  // const { hideAll, hideSidebar, setHideSidebar } = useAppContext();
  const { hideSidebar, user } = useDashboardContext();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoadingUrl(null);
  }, [pathname]);

  if (pathname === "/dashboard/login") {
    return <></>;
  }

  return (
    <div
      className={`h-screen bg-sidebar w-[100%] lg:w-[30%] xl:w-[350px] flex flex-col justify-between ${
        hideSidebar ? "hidden" : ""
      }`}
    >
      <div>
        {/* TODO fitur hide side bar */}
        <div className="flex justify-between border-b-[1px] py-3 px-3">
          <div className="flex w-full gap-3 items-center">
            <img src="/logo/logo192.png" alt="Mindo" className="h-[30px]" />
            {/* <Image
              height={30}
              width={30}
              src="/logo/logo192.png"
              alt="logo mindo"
            ></Image> */}
            Classroom
          </div>
          <div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              }}
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun />
                ) : (
                  <Moon />
                )
              ) : (
                <span className="h-6 w-6" />
              )}
            </Button>
          </div>
          {/* <Button
            className="lg:hidden"
            size="icon"
            variant="ghost"
            // onClick={() => {
            //   hideSidebar ? setHideSidebar(false) : setHideSidebar(true);
            // }}
          >
            <X />
          </Button> */}
        </div>
        <div className="flex w-full flex-col gap-1 border-b px-3 py-3">
          <p className="truncate font-medium">{user?.name || "-"}</p>
          <p className="text-sm uppercase text-muted-foreground">
            {user?.role || "-"}
          </p>
        </div>
        <div></div>
        <div className="mt-5 px-2 overflow-y-auto">
          <div>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => {
                const active = isActiveMenu(pathname, item.url);
                const isLoading = loadingUrl === item.url;

                return (
                  <Link
                    key={index}
                    href={item.url}
                    aria-current={active ? "page" : undefined}
                    aria-disabled={isLoading}
                    className="mx-4"
                    onClick={(event) => {
                      if (active || isLoading) {
                        event.preventDefault();
                        return;
                      }

                      if (
                        event.button !== 0 ||
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey
                      ) {
                        return;
                      }

                      setLoadingUrl(item.url);
                    }}
                  >
                    <div
                      className={`flex gap-2 items-center rounded-lg px-2 py-2 transition-colors ${
                        active || isLoading
                          ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
                          : "text-sidebar-foreground/80 hover:bg-[#E2E2E2] hover:text-sidebar-foreground dark:hover:bg-[#3A3A3A]"
                      }`}
                    >
                      <div className="mr-2">
                        {isLoading ? (
                          <Loader2
                            className="animate-spin"
                            strokeWidth={1.5}
                            size={20}
                          />
                        ) : (
                          item.icon
                        )}
                      </div>
                      <div>{item.title}</div>
                      {isLoading ? (
                        <span className="ml-auto text-xs">Memuat...</span>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex flex-col gap-2 mb-5 pt-2">
        {menu.map((item, index) => (
          <Link key={index} href={item.url} className="mx-4">
            <div
              className={`flex gap-2 items-center px-2 py-2 rounded-lg
              `}
            >
              <div className="mr-2">{item.icon}</div>
              <div>{item.title}</div>
            </div>
          </Link>
        ))}
      </div> */}
    </div>
  );
}
