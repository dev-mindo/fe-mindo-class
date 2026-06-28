import { AppSidebar } from "./_component/app-sidebar";
import { AppTopBar } from "./_component/top-bar";
import { DashboardProvider } from "@/context/DashboardContext";
import { DashboardBreadcrumb } from "./_component/breadcrumb";
import { DashboardSessionGuard } from "./_component/dashboard-session-guard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardSessionGuard>
        <main className="fixed inset-0 flex overflow-hidden">
          <AppSidebar />
          <div className="flex min-h-0 w-full flex-col">
            <AppTopBar />
            <DashboardBreadcrumb />
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="mx-auto w-[95%] py-10">{children}</div>
            </div>
          </div>
        </main>
      </DashboardSessionGuard>
    </DashboardProvider>
  );
}
