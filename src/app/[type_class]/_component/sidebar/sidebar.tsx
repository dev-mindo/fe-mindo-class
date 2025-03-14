"use client";
import {
  ArrowLeftFromLine,
  BookText,
  CircleCheckBig,
  ClipboardList,
  FileBadge,
  Info,
  ListTodo,
  Lock,
  MessagesSquare,
  SquarePlay,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppContext } from "../navProvider";
import { usePathname } from "next/navigation";

type Props = {
  dataSection: TNavClass["sectionMenu"] | null;
  baseUrl: string;
};

export const Sidebar = ({ dataSection, baseUrl }: Props) => {
  const { setTheme, theme } = useTheme();
  const [getCurrentTheme, setCurrentTheme] = useState<string>("");
  const { hideAll, hideSidebar, setHideSidebar } = useAppContext();

  useEffect(() => {
    console.log(hideAll);
    setCurrentTheme(theme || "");
  }, [theme]);

  if (hideAll || hideSidebar) {
    return <></>;
  }

  const iconModule = [
    {
      type: "INFO",
      icon: <Info strokeWidth={1.5} size={20} />,
    },
    {
      type: "DISCUSSION",
      icon: <MessagesSquare strokeWidth={1.5} size={20} />,
    },
    {
      type: "QUIZ",
      icon: <ListTodo strokeWidth={1.5} size={20} />,
    },
    {
      type: "VIDEO",
      icon: <SquarePlay strokeWidth={1.5} size={20} />,
    },
    {
      type: "EVALUATION",
      icon: <ClipboardList strokeWidth={1.5} size={20} />,
    },
    {
      type: "CERTIFICATE",
      icon: <FileBadge strokeWidth={1.5} size={20} />,
    },
    {
      type: "MATERIAL",
      icon: <BookText strokeWidth={1.5} size={20} />,
    },
  ];

  const sectionMenu = dataSection?.map((section) => ({
    title: section.title,
    slug: section.slug,
    modules: section.modules.map((module) => ({
      title: module.menuTitle,
      icon: iconModule.find((item) => item.type === module.type)?.icon,
      link: `${baseUrl}/${section.slug}/${module.slug}`,
      isLocked:
        module.UserModule.length === 0 ||
        (module.UserModule.length > 0 &&
          module.UserModule[0].status === "LOCKED"),
      isDone:
        module.UserModule.length > 0 && module.UserModule[0].status === "DONE",
      current: module.current,
    })),
  }));

  const menu = [
    {
      title: "Left Class",
      icon: <ArrowLeftFromLine strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: false,
      isDone: false,
    },
  ];

  type SectionMenuType = NonNullable<typeof sectionMenu>;

  const setStyleSidebar = (
    module: SectionMenuType[number]["modules"][number]
  ) => {
    const baseClasses = module.current
      ? "bg-primary hover:bg-primary text-white"
      : "";
    const lockedClasses = module.isLocked
      ? "cursor-not-allowed opacity-50 hover:bg-white hover:bg-sidebar"
      : "";

    return theme === "light"
      ? `${baseClasses} ${lockedClasses}`
      : theme === "dark"
      ? `${baseClasses} ${lockedClasses} ${
          module.current ? "bg-primary hover:bg-primary" : ""
        }`
      : theme === "system"
      ? `${baseClasses} ${lockedClasses}`
      : "";
  };

  return (
    <div
      className={`h-screen bg-sidebar w-[100%] lg:w-[30%] xl:w-[20%] flex flex-col justify-between ${
        hideSidebar ? "hidden" : ""
      }`}
    >
      <div>
        <div className="flex items-center mx-4 mt-3 justify-between">
          <div className="flex items-center gap-2">
            <Image
              height={100}
              width={30}
              src="/logo/mindo-logo.svg"
              alt="logo mindo"
            ></Image>
            Mindo Class
          </div>
          <div className="">
            {/* TODO fitur hide side bar */}
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
            <Button
              className="lg:hidden"
              size="icon"
              variant="ghost"
              onClick={() => {
                hideSidebar ? setHideSidebar(false) : setHideSidebar(true);
              }}
            >
              <X/>
            </Button>
          </div>
        </div>
        <div className="mt-5 px-2">
          {sectionMenu?.map((item, index) => (
            <div>
              <div className="font-bold text-lg mx-2">{item.title}</div>
              <div className="flex flex-col gap-2 mt-4">
                {item.modules.map((module) => (
                  <Link
                    key={index}
                    href={module.link}
                    className="mx-4"
                    onClick={(e) => {
                      if (module.isLocked) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <div
                      className={`flex gap-2 items-center px-2 py-2 rounded-lg dark:hover:bg-[#3A3A3A] hover:bg-[#E2E2E2] ${
                        getCurrentTheme === "light"
                          ? `${
                              module.current
                                ? "bg-primary hover:bg-primary text-white"
                                : ""
                            } 
                           ${
                             module.isLocked
                               ? "cursor-not-allowed opacity-50 hover:bg-sidebar"
                               : ""
                           }`
                          : getCurrentTheme === "dark"
                          ? `${
                              module.current
                                ? "bg-primary hover:bg-primary text-white"
                                : ""
                            } 
                           ${
                             module.isLocked
                               ? "cursor-not-allowed opacity-50 hover:bg-sidebar"
                               : ""
                           } 
                           ${
                             module.current ? "bg-primary hover:bg-primary" : ""
                           }`
                          : getCurrentTheme === "system"
                          ? `${
                              module.current
                                ? "bg-primary hover:bg-primary text-white"
                                : ""
                            } 
                           ${
                             module.isLocked
                               ? "cursor-not-allowed opacity-50 hover:bg-sidebar"
                               : ""
                           }`
                          : ""
                      }`}
                    >
                      <div className="mr-2">{module.icon}</div>
                      <div>{module.title}</div>
                      <div className="ml-auto">
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
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {menu.map((item, index) => (
          <Link key={index} href={item.link} className="mx-4">
            <div
              className={`flex gap-2 items-center px-2 py-2 rounded-lg ${setStyleSidebar}
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
};
