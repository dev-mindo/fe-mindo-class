import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="h-screen bg-white w-[20%]">
        <div className="flex items-center gap-2 ml-2 mt-3">
          <Image
            height={100}
            width={30}
            src="/logo/mindo-logo.svg"
            alt="logo mindo"
          ></Image>
          Mindo Class
        </div>
      </div>
      <div className="flex flex-col justify-between h-screen w-full">
        <div className="flex items-center justify-between bg-white h-16 pl-4">
          <div className="mr-2 flex items-center">
            {/* <Button size="icon" variant="ghost">
              <ChevronLeft />
            </Button> */}
            <h1>Video Learning Node JS</h1>
          </div>
          <div className="w-[20%] mr-4">
            Progress 30%
            <div className="w-[100%]">
              <Progress value={33} />
            </div>
          </div>
        </div>
        <div className="h-full">
          <div className="mx-auto w-[95%] my-10">{children}</div>
        </div>
        <div className="flex justify-between items-center bg-white h-16">
          <div className="ml-8">
            <Button>
              <ChevronLeft />
              Kembali
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
    </div>
  );
}
