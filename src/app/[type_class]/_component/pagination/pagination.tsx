"use client";
import { Button } from "@/components/ui/button";
import { clearCachesByServerAction } from "@/lib/action/quiz";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertDialogPagination } from "./AlertDialog";
import { useAppContext } from "../navProvider";

type Props = {
  dataSection: TNavClass["sectionMenu"] | null;
  baseUrl: string;
  currentPage: TCurrentPageNav;
};
export const Pagination = ({ dataSection, baseUrl, currentPage }: Props) => {
  const router = useRouter();
  const [isOpenAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [messageAlertDialog, setMessageAlertDialog] = useState<string>("");
  const { hideAll, setHideAll } = useAppContext();

  if (hideAll) {
    return <></>;
  }


  const getPrevNextModule = (navMenu: TNavClass["sectionMenu"]) => {
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

  const handleNextPage = async () => {
    const getNextStep = getPrevNextModule(
      dataSection as TNavClass["sectionMenu"]
    );

    if (getNextStep.at(0)?.next.at(0)?.status === "DONE") {
      router.push(
        `${baseUrl}/${getNextStep[0].slug}/${
          getNextStep.at(0)?.next.at(0)?.slug
        }`
      );
    } else {
      const saveStep1: ApiResponse = await fetchApi(`/classroom/save-step`, {
        method: "POST",
        body: {
          moduleId: currentPage?.id,
          status: "DONE",
        },
      });

      if (saveStep1.success) {
        const saveStep2: ApiResponse = await fetchApi(`/classroom/save-step`, {
          method: "POST",
          body: {
            moduleId: getNextStep.at(0)?.next.at(0)?.id,
            status: "OPEN",
          },
        });
        if (saveStep2.success) {
          clearCachesByServerAction(
            `${baseUrl}/${getNextStep[0].slug}/${
              getNextStep.at(0)?.next.at(0)?.slug
            }`
          );
          router.push(
            `${baseUrl}/${getNextStep[0].slug}/${
              getNextStep.at(0)?.next.at(0)?.slug
            }`
          );
        }
      } else if (saveStep1.statusCode === 403) {
        setMessageAlertDialog(saveStep1.message);
        setOpenAlertDialog(true);
      }

      console.log(saveStep1)
    }
  };

  const handleBackPage = () => {
    const getNextStep = getPrevNextModule(
      dataSection as TNavClass["sectionMenu"]
    );
    router.push(
      `${baseUrl}/${getNextStep[0].slug}/${getNextStep[0].previous[0].slug}`
    );
  };
  return (
    <div className="flex justify-between items-center bg-sidebar h-16">
      <div className="ml-8">
        <Button onClick={handleBackPage} disabled={currentPage?.step === 1}>
          <ChevronLeft />
          Kembali
        </Button>
      </div>
      <div className="mr-8">
        <Button onClick={handleNextPage}>
          Selanjutnya
          <ChevronRight />
        </Button>
      </div>
      <AlertDialogPagination
        isOpen={isOpenAlertDialog}
        setIsOpen={setOpenAlertDialog}
        message=""
        title={messageAlertDialog}
      />
    </div>
  );
};
