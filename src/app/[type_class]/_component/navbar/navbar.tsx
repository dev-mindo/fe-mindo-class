import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft } from "lucide-react";

type Props = {
  title: string;
  progress: number;
};

export const Navbar = (props: Props) => {
  return (
    <div className="flex items-center justify-between bg-sidebar h-16 pl-4">
      <div className="mr-2 flex items-center gap-2">
        <Button size="icon" variant="ghost">
          <ChevronLeft />
        </Button>
        <h1>{props.title}</h1>
      </div>
      <div className="w-[20%] mr-4">
        Progress {props.progress}%
        <div className="w-[100%] mt-2">
          <Progress value={props.progress} />
        </div>
      </div>
    </div>
  );
};
