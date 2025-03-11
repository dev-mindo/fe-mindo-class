import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Sidebar } from "../../../_component/sidebar/sidebar";
import { notFound, usePathname } from "next/navigation";
import { Navbar } from "../../../_component/navbar/navbar";
import { headers } from "next/headers";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
  children: React.ReactNode;
};

export default async function Layout({
  params,
  children
}: Props) {
  const pathname = headers().get("x-invoke-path") || "";
  const urlPath = new RegExp(
    /(\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/quiz\/[^/?]+|\/evaluation\/[^/]+)$/
  );

  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/${params.type_class}/${params.slug}`

  const getClass: ApiResponse<TNavClass> = await fetchApi(`/classroom/nav-module/${params.section}/${params.module}`);

  if (getClass && !getClass.success) notFound();

  if (pathname.match(urlPath)) {
    return <>{children}</>;
  }

  const getCurrent = getClass.data?.sectionMenu
    .map((item) => item.modules)
    .flat().filter(item => item.current)[0];  

  return (
    <div className="flex">
      <Sidebar baseUrl={baseUrl} dataSection={getClass.data ? getClass.data.sectionMenu : null}/>
      <div className="flex flex-col justify-between h-screen w-full">
        <Navbar progress={getClass.data?.progress || 0} title={getCurrent?.title || ''} />
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          <div className="mx-auto w-[95%] my-10">{children}</div>
        </div>
        <div className="flex justify-between items-center bg-sidebar h-16">
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
