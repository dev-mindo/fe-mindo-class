import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "../../../_component/sidebar/sidebar";
import { notFound, usePathname } from "next/navigation";
import { Navbar } from "../../../_component/navbar/navbar";
import { headers } from "next/headers";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Pagination } from "@/app/[type_class]/_component/pagination/pagination";
import { NavProvider } from "@/app/[type_class]/_component/navProvider";
import { MainContent } from "@/app/[type_class]/_component/content/MainContent";

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
  pathName: string;
  children: React.ReactNode;
};

export default async function Layout({ params, children }: Props) {
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/${params.type_class}/${params.slug}`;

  const getClass: ApiResponse<TNavClass> = await fetchApi(
    `/classroom/nav-module/${params.section}/${params.module}`
  );

  if (getClass && !getClass.success) notFound();  

  // if (urlPath.test(pathname)) {
  //   return <>{children}</>;
  // }

  const getCurrent = getClass.data?.sectionMenu
    .map((item) => item.modules)
    .flat()
    .filter((item) => item.current)[0];

  return (
    <div>
      <NavProvider>
        <Sidebar
          baseUrl={baseUrl}
          dataSection={getClass.data ? getClass.data.sectionMenu : null}
        />
        <div className="flex flex-col justify-between h-screen w-full">
          <Navbar
            totalModules={getClass.data?.totalModules || 0}
            progress={getClass.data?.progress || 0}
            title={getCurrent?.title || ""}
          />
          <MainContent children={children} />
          <Pagination
            dataSection={getClass.data ? getClass.data.sectionMenu : null}
            baseUrl={baseUrl}
            currentPage={getCurrent}
          />
        </div>
      </NavProvider>
    </div>
  );
}
