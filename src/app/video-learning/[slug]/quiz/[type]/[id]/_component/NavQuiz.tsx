"use client";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  title: string;
  completed: number;
  totalQuestion: number;
  time: string;
  children: React.ReactNode;
};

export function navQuiz({ title, children }: Props) {
  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="flex items-center bg-sidebar h-16 p-4 justify-between">
        <div className="flex items-center">
          <div className="mr-2">
            <Button size="icon" variant="ghost">
              <ChevronLeft />
            </Button>
          </div>
          <h1>Pretes Quiz Food Safety Management System</h1>
        </div>
        <div className="flex gap-4 w-[20%] left-0">
          <div>
            <div>
              Menyelesaikan 3/10
              <div className="w-[100%]">
                <Progress value={33} />
              </div>
            </div>
            <div>00:00:00</div>
          </div>
        </div>
      </div>
      <div className="h-full">
        <div className="mx-auto w-[95%] my-10">{children}</div>
      </div>
      <div className="flex justify-between items-center bg-sidebar h-16">
        <div className="ml-8">
          <Button>
            <ChevronLeft />
            Sebelumnya
          </Button>
        </div>
        <div className="mr-8">
          <Button>
            Selanjutnya
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
