"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const breadcrumbLabels: Record<string, string> = {
  dashboard: "Dashboard",
  classroom: "Kelas",
  module: "Modul",
  "list-participant": "Peserta",
  quiz: "Kuis",
  task: "Tugas",
  video: "Video",
  "video-learning": "Video Learning",
  discussion: "Diskusi",
  evaluation: "Evaluasi",
  user: "Pengguna",
  login: "Login",
  create: "Tambah",
  detail: "Detail",
  edit: "Edit",
};

const formatBreadcrumbLabel = (segment: string) => {
  if (breadcrumbLabels[segment]) {
    return breadcrumbLabels[segment];
  }

  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);

    return segments.map((segment, index) => ({
      href: `/${segments.slice(0, index + 1).join("/")}`,
      label: formatBreadcrumbLabel(segment),
    }));
  }, [pathname]);

  if (pathname === "/dashboard/login") {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b bg-background px-3 py-2"
    >
      <ol className="mx-auto flex w-[95%] min-w-0 flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={breadcrumb.href} className="flex items-center gap-1">
              {isLast ? (
                <span className="font-medium text-foreground">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="transition-colors hover:text-foreground"
                >
                  {breadcrumb.label}
                </Link>
              )}
              {!isLast ? <ChevronRight size={14} /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
