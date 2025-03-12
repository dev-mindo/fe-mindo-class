"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppContext } from "../navProvider";

type Props = {
  title: string;
  progress: number;
  totalModules: number;
};

export const Navbar = (props: Props) => {
  const { hideAll, hideSidebar, setHideSidebar } = useAppContext();

  if (hideAll) {
    return <></>;
  }

  return (
    <div className={`flex items-center justify-between bg-sidebar h-16 pl-4`}>
      <div className="mr-2 flex items-center gap-2">
        <Button
          onClick={() => {
            hideSidebar ? setHideSidebar(false) : setHideSidebar(true);
          }}
          size="icon"
          variant="ghost"
        >
          {hideSidebar ? <ChevronRight /> : <ChevronLeft />}
        </Button>
        <h1>{props.title}</h1>
      </div>
      <div className="w-[40%] sm:w-[30%] lg:w-[20%] mr-4">
        Progress {Math.round((100 / props.totalModules) * props.progress)}%
        <div className="w-[100%] mt-2">
          <Progress
            value={Math.round((100 / props.totalModules) * props.progress)}
          />
        </div>
      </div>
    </div>
  );
};
