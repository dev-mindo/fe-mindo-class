'use client'
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeftFromLine,
  CircleCheckBig,
  ClipboardList,
  FileBadge,
  Info,
  ListTodo,
  Lock,
  MessagesSquare,
  SquarePlay,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Sidebar = () => {
  const { setTheme, theme } = useTheme();
  useEffect(() => {
    console.log(theme);
  }, []);
  const modules = [
    {
      title: "Introduction",
      icon: <Info strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: false,
      isDone: true,
    },
    {
      title: "Discussion",
      icon: <MessagesSquare strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: false,
      isDone: false,
    },
    {
      title: "Pretest Quiz",
      icon: <ListTodo strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: false,
      isDone: false,
    },
    {
      title: "Video Learning",
      icon: <SquarePlay strokeWidth={1.5} size={20} />,
      link: "/video-learning",
      isLocked: false,
      isDone: false,
    },
    {
      title: "Posttest Quiz",
      icon: <ListTodo strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: true,
      isDone: false,
    },
    {
      title: "Evaluation",
      icon: <ClipboardList strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: true,
      isDone: false,
    },
    {
      title: "Certificate",
      icon: <FileBadge strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: true,
      isDone: false,
    },
  ];

  const menu = [
    {
      title: "Left Class",
      icon: <ArrowLeftFromLine strokeWidth={1.5} size={20} />,
      link: "/",
      isLocked: false,
      isDone: false,
    },
  ];

  return (
    <div className="h-screen bg-sidebar w-[20%] flex flex-col justify-between">
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
            <Button
              size="icon"
              variant="ghost"
              onClick={() => {
                theme === "system" || theme === "light"
                  ? setTheme("dark")
                  : setTheme("light");
              }}
            >
              {theme === "system" || theme === "light" ? (<Moon />) : (<Sun />)}
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-5">
          {modules.map((item, index) => (
            <Link key={index} href={item.link} className="mx-4">
              <div
                className={`flex gap-2 items-center px-2 py-2 rounded-lg hover:bg-[#ebeced] ${
                  item.isLocked &&
                  "cursor-not-allowed opacity-50 hover:bg-white"
                }`}
              >
                <div className="mr-2">{item.icon}</div>
                <div>{item.title}</div>
                <div className="ml-auto">
                  {item.isLocked && <Lock strokeWidth={1.5} size={20} />}
                  {item.isDone && (
                    <CircleCheckBig color="green" strokeWidth={1.5} size={20} />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-5">
        {menu.map((item, index) => (
          <Link key={index} href={item.link} className="mx-4">
            <div
              className={`flex gap-2 items-center px-2 py-2 rounded-lg hover:bg-[#ebeced] ${
                item.isLocked && "cursor-not-allowed opacity-50 hover:bg-white"
              }`}
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
