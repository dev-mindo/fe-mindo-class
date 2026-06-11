import { AppSidebar } from "./_component/app-sidebar";
import { AppTopBar } from "./_component/top-bar";
import { DashboardProvider } from "@/context/DashboardContext";
import { DashboardBreadcrumb } from "./_component/breadcrumb";
import { DashboardSessionGuard } from "./_component/dashboard-session-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardSessionGuard>
        <main className="flex">
          <AppSidebar />
          <div className="flex h-screen w-full flex-col justify-between">
            <AppTopBar />
            <DashboardBreadcrumb />
            <div className="h-[100vh] overflow-y-auto">
              <div className="mx-auto my-10 w-[95%]">{children}</div>
            </div>
          </div>
        </main>
      </DashboardSessionGuard>
    </DashboardProvider>
  );
}
