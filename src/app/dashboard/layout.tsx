import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_component/app-sidebar";
import { AppTopBar } from "./_component/top-bar";
import { DashboardProvider } from "@/context/DashboardContext";
import { DashboardBreadcrumb } from "./_component/breadcrumb";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex">
      <DashboardProvider>
      <AppSidebar />
      <div className="flex flex-col justify-between h-screen w-full">
          <AppTopBar />
          <DashboardBreadcrumb />
        <div className="overflow-y-auto h-[100vh]">
          <div className="mx-auto w-[95%] my-10">{children}</div>
        </div>
      </div>
      </DashboardProvider>
    </main>
  );
}
