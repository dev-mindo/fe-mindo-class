import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./_component/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="h-screen w-screen">
        <SidebarTrigger />
        <div className="flex mx-auto w-[95%]">{children}</div>
      </main>
    </SidebarProvider>
  );
}
