"use client";

import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { PrevNextModule } from "../pagination";
import { useRouter } from "next/navigation";
import { clearCachesByServerAction } from "@/lib/action/quiz";
import { AlertDialogPagination } from "../AlertDialog";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { IAlertDialog } from "@/components/base/IAlertDialog";

type Props = {
  baseUrl: string;
  dataSection: TNavClass["sectionMenu"] | null;
  getPrevNextModule: (
    dataSection: TNavClass["sectionMenu"]
  ) => PrevNextModule[];
  currentPage: TCurrentPageNav;
};

export const HandleNextPage = (props: Props) => {
  const router = useRouter();
  const [isOpenAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [messageAlertDialog, setMessageAlertDialog] = useState<string>("");
  const [redirectUrl, setRedirectUrl] = useState<string>("");

  const handleNextPage = async () => {
    console.log(props.dataSection);
    
    if (!props.dataSection) {
      // Optionally handle the null case, e.g., return early or show an error
      return;
    }
    const getNextStep = props.getPrevNextModule(props.dataSection);

    const currentModuleIndex = getNextStep.findIndex((section) =>
      section.modules.some((module) => module.current)
    );

    const nextModule = getNextStep.at(currentModuleIndex)?.next.at(0);

    //TODO ubah disini
    if (nextModule?.status === "DONE") {
      router.push(
        `${props.baseUrl}/${getNextStep[currentModuleIndex].slug}/${nextModule?.slug}`
      );
    } else {
      const saveStep1: ApiResponse = await fetchApi(`/classroom/save-step`, {
        method: "POST",
        body: {
          moduleId: props.currentPage?.id,
          status: "DONE",
        },
      });
      if (saveStep1.statusCode === 200) {
        console.log("step1");
        console.log("step next", getNextStep);
        console.log("next module", nextModule);
        console.log("current", props.currentPage);
        const saveStep2: ApiResponse = await fetchApi(`/classroom/save-step`, {
          method: "POST",
          body: {
            moduleId: nextModule?.id,
            status: "OPEN",
          },
        });
        console.log("step2", saveStep2);
        setMessageAlertDialog(saveStep2.message);
        if (saveStep2.statusCode === 200) {
          console.log("step2");
          clearCachesByServerAction(
            `${props.baseUrl}/${getNextStep[currentModuleIndex].slug}/${nextModule?.slug}`
          );
          router.push(
            `${props.baseUrl}/${getNextStep[currentModuleIndex].slug}/${nextModule?.slug}`
          );
        } else {            
            setMessageAlertDialog(saveStep2.message);
            setOpenAlertDialog(true);
          if (
            saveStep2.statusCode === 403 &&
            saveStep2.errorCode === "ERR_PAGE_MODULES_FORBIDEN"
          ) {
            setRedirectUrl(
              `${props.baseUrl}/${saveStep2.data.sectionSlug}/${saveStep2.data.moduleSlug}`
            );
          } else {
            setRedirectUrl(
              `${props.baseUrl}/${getNextStep[currentModuleIndex].slug}/${nextModule?.slug}`
            );
          }
        }
      } else {
        if (
          saveStep1.statusCode === 403 &&
          saveStep1.errorCode === "ERR_PAGE_MODULES_FORBIDEN"
        ) {
          setRedirectUrl(
            `${props.baseUrl}/${saveStep1.data.sectionSlug}/${saveStep1.data.moduleSlug}`
          );
        } else {
          `${props.baseUrl}/${getNextStep[currentModuleIndex].slug}/${nextModule?.slug}`;
        }

        setMessageAlertDialog(saveStep1.message);
        setOpenAlertDialog(true);
      }

      console.log(saveStep1);
    }
  };

  useEffect(() => {
    console.log('open alert dialog', isOpenAlertDialog)
  }, [])

  useEffect(() => {
    console.log('open alert dialog', isOpenAlertDialog)
  }, [isOpenAlertDialog])

  return (
    <>
      <Button onClick={handleNextPage}>
        Selanjutnya
        <ChevronRight />
      </Button>
      <IAlertDialog
        isOpen={isOpenAlertDialog}
        message={messageAlertDialog}
        title="Error Info"
        redirectUrl={redirectUrl}
        setIsOpenDialog={setOpenAlertDialog}
      />
    </>
  );
};
