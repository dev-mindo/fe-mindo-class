import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_component/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex">
      <AppSidebar />
      <div className="flex flex-col justify-between h-screen w-full">
        <div className="overflow-y-auto h-[100vh]">
          <div className="mx-auto w-[95%] my-10">{children}</div>
        </div>
      </div>
    </main>
  );
}
