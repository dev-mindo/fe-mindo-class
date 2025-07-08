"use client";
import { Button } from "@/components/ui/button";
import { clearCachesByServerAction } from "@/lib/action/quiz";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertDialogPagination } from "./AlertDialog";
import { useAppContext } from "../navProvider";
import { HandleNextPage } from "./_component/HandleNextPage";
import { HandleBackPage } from "./_component/HandleBackPage";

type Props = {
  dataSection: TNavClass["sectionMenu"] | null;
  baseUrl: string;
  currentPage: TCurrentPageNav;
};

export type PrevNextModule = {
  previous: TNavClass["sectionMenu"][number]["modules"];
  next: TNavClass["sectionMenu"][number]["modules"];
} & TNavClass["sectionMenu"][number];

export const Pagination = ({ dataSection, baseUrl, currentPage }: Props) => {
  const { hideAll, setHideAll } = useAppContext();
  const pathname = usePathname();

  const urlPathDiscussion = new RegExp(
    /(\/[^/]+\/[^/]+\/[^/]+\/[^/]+\/detail-discussion\/\d+)$/
  );

  if (hideAll || pathname.match(urlPathDiscussion)) {
    return <></>;
  }

  const getPrevNextModule = (
    navMenu: TNavClass["sectionMenu"]
  ): PrevNextModule[] => {
    return navMenu.map((section) => {
      const modules = section.modules;

      // Cari index module yang memiliki `current: true`
      const currentIndex = modules.findIndex((module) => module.current);

      // Cari module sebelumnya dan berikutnya
      const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
      const nextModule = currentIndex !== -1 ? modules[currentIndex + 1] : null;

      return {
        ...section,
        previous: prevModule ? [prevModule] : [],
        next: nextModule ? [nextModule] : [],
      };
    });
  };

  return (
    <div className="flex justify-between items-center bg-sidebar h-16">
      <div className="ml-8">
        <HandleBackPage
          baseUrl={baseUrl}
          currentPage={currentPage}
          dataSection={dataSection}
          getPrevNextModule={(dataSection) =>
            getPrevNextModule(dataSection as TNavClass["sectionMenu"])
          }
        />
      </div>
      <div className="mr-8">
        <HandleNextPage
          baseUrl={baseUrl}
          currentPage={currentPage}
          dataSection={dataSection}
          getPrevNextModule={(dataSection) =>
            getPrevNextModule(dataSection as TNavClass["sectionMenu"])
          }
        />
      </div>
    </div>
  );
};
