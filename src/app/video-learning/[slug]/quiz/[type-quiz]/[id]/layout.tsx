import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="flex items-center bg-white h-16 pl-4">
        <div className="mr-2">
          <Button size="icon" variant="ghost">
            <ChevronLeft />
          </Button>
        </div>
        <div>
          <h1>Quiz Tentang Node JS</h1>
        </div>
      </div>
      <div className="h-full">
        <div className="mx-auto w-[95%] my-10">{children}</div>
      </div>
      <div className="flex justify-between items-center bg-white h-16">
        <div>
          {/* <Button>
            <ChevronLeft />
          </Button> */}
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
