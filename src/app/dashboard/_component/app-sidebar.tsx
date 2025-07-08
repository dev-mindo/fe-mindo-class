"use client";
import {
  ArrowLeftFromLine,
  ClipboardList,
  FileText,
  Home,
  Info,
  LayoutDashboard,
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

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "#",
    icon: <LayoutDashboard strokeWidth={1.5} size={20} />,
  },
  {
    title: "Kelas",
    url: "#",    
    icon: <SquareUserRound strokeWidth={1.5} size={20} />,
  },
  {
    title: "Modul",
    url: "#",      
    icon: <SquareMenu strokeWidth={1.5} size={20} />,
  },
  {
    title: "Peserta",
    url: "#",
    icon: <Users strokeWidth={1.5} size={20} />,
  },
  {
    title: "Kuis",
    url: "#",
    icon: <ClipboardList strokeWidth={1.5} size={20} />,
  },
  {
    title: "Tugas",
    url: "#",
    icon: <FileText strokeWidth={1.5} size={20} />,
  },
  {
    title: "Video",
    url: "#",
    icon: <MonitorPlay strokeWidth={1.5} size={20} />,
  },
  {
    title: "Diskusi",
    url: "#",    
    icon: <MessageSquareText strokeWidth={1.5} size={20} />,
  },
  {
    title: "Pengguna",
    url: "#",
    icon: <User strokeWidth={1.5} size={20} />,
  },
];

const menu = [
  {
    title: "Logout",
    icon: <ArrowLeftFromLine strokeWidth={1.5} size={20} />,
    url: process.env.NEXT_PUBLIC_MINDO_MY_CLASS,
  },
];

export function AppSidebar() {  
  const { setTheme, theme } = useTheme();
  const [getCurrentTheme, setCurrentTheme] = useState<string>("");
  // const { hideAll, hideSidebar, setHideSidebar } = useAppContext();
  const pathname = usePathname();

  if (pathname === "/dashboard/login") {
    return <></>;
  }

  return (
    <div
      className={`h-screen bg-sidebar w-[100%] lg:w-[30%] xl:w-[20%] flex flex-col justify-between ${
        // hideSidebar ? "hidden" : ""
        ""
      }`}
    >
      <div>
        {/* TODO fitur hide side bar */}
        <div className="flex justify-end mx-4 mt-3">
          <div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                theme === "system" || theme === "light"
                  ? setTheme("dark")
                  : setTheme("light");
              }}
            >
              {theme === "system" || theme === "light" ? <Moon /> : <Sun />}
            </Button>
          </div>
          <Button
            className="lg:hidden"
            size="icon"
            variant="ghost"
            // onClick={() => {
            //   hideSidebar ? setHideSidebar(false) : setHideSidebar(true);
            // }}
          >
            <X />
          </Button>
        </div>
        <div className="flex flex-col items-center w-full">
          <div>
            <Image
              height={300}
              width={90}
              src="/logo/mindo-logo.svg"
              alt="logo mindo"
            ></Image>
          </div>
          <div className="">
            <p>
              {/* TODO username */}
            </p>
          </div>
        </div>
        <div></div>
        <div className="mt-5 px-2 overflow-y-auto h-[calc(90vh-8rem)]">
          <div>
            <div className="flex flex-col gap-2">
              {items.map((item, index) => (
                <Link key={index} href={item.url} className="mx-4">
                  <div
                    className={`flex gap-2 items-center px-2 py-2 rounded-lg dark:hover:bg-[#3A3A3A] hover:bg-[#E2E2E2] ${
                      // getCurrentTheme === "light"
                      //   ? `${
                      //       module.current
                      //         ? "bg-primary hover:bg-primary text-white"
                      //         : ""
                      //     }
                      //    ${
                      //      module.isLocked
                      //        ? "cursor-not-allowed opacity-50 hover:bg-sidebar"
                      //        : ""
                      //    }`
                      //   : getCurrentTheme === "dark"
                      //   ? `${
                      //       module.current
                      //         ? "bg-primary hover:bg-primary text-white"
                      //         : ""
                      //     }
                      //    ${
                      //      module.isLocked
                      //        ? "cursor-not-allowed opacity-50 hover:bg-sidebar"
                      //        : ""
                      //    }
                      //    ${
                      //      module.current ? "bg-primary hover:bg-primary" : ""
                      //    }`
                      //   : getCurrentTheme === "system"
                      //   ? `${
                      //       module.current
                      //         ? "bg-primary hover:bg-primary text-white"
                      //         : ""
                      //     }
                      //    ${
                      //      module.isLocked
                      //        ? "cursor-not-allowed opacity-50 hover:bg-sidebar"
                      //        : ""
                      //    }`
                      //   :
                      ""
                    }`}
                  >
                    <div className="mr-2">{item.icon}</div>
                    <div>{item.title}</div>
                    {/* <div className="ml-auto">
                        {module.isLocked && (
                          <Lock strokeWidth={1.5} size={20} />
                        )}
                        {module.isDone && (
                          <CircleCheckBig
                            color="green"
                            strokeWidth={1.5}
                            size={20}
                          />
                        )}
                      </div> */}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-5 pt-2">
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
      </div>
    </div>
  );
}
