"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { PrevNextModule } from "../pagination";
import { IAlertDialog } from "@/components/base/IAlertDialog";
import { useState } from "react";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { clearCachesByServerAction } from "@/lib/action/quiz";

type Props = {
  baseUrl: string;
  dataSection: TNavClass["sectionMenu"] | null;
  getPrevNextModule: (
    dataSection: TNavClass["sectionMenu"]
  ) => PrevNextModule[];
  currentPage: TCurrentPageNav;
};

export const HandleBackPage = (props: Props) => {
  const router = useRouter();
  const [isOpenAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [messageAlertDialog, setMessageAlertDialog] = useState<string>("");
  const [redirectUrl, setRedirectUrl] = useState<string>("");

  const handleBackPage = async () => {
    if (!props.dataSection) {
      // Optionally handle the null case, e.g., return early or show an error
      return;
    }

    const getPrevStep = props.getPrevNextModule(props.dataSection);

    const currentModuleIndex = getPrevStep.findIndex((section) =>
      section.modules.some((module) => module.current)
    );

    const prevModule = getPrevStep.at(currentModuleIndex)?.next.at(0);

    if(prevModule?.status === "DONE") {
      router.push(
        `${props.baseUrl}/${getPrevStep[0].slug}/${getPrevStep[0].previous[0].slug}`
      );
    } else {
          const saveStep1: ApiResponse = await fetchApi(`/classroom/save-step`, {
            method: "POST",
            body: {
              moduleId: props.currentPage?.id,
              status: "DONE",
              navigation: "NEXT"
            },
          });
          if (saveStep1.statusCode === 200) {            
            const saveStep2: ApiResponse = await fetchApi(`/classroom/save-step`, {
              method: "POST",
              body: {
                moduleId: prevModule?.id,
                status: "OPEN",
                navigation: "NEXT"
              },
            });
            console.log("step2", saveStep2);
            setMessageAlertDialog(saveStep2.message);
            if (saveStep2.statusCode === 200) {
              console.log("step2");
              clearCachesByServerAction(
                `${props.baseUrl}/${getPrevStep[currentModuleIndex].slug}/${prevModule?.slug}`
              );
              router.push(
                `${props.baseUrl}/${getPrevStep[currentModuleIndex].slug}/${prevModule?.slug}`
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
                  `${props.baseUrl}/${getPrevStep[currentModuleIndex].slug}/${prevModule?.slug}`
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
              `${props.baseUrl}/${getPrevStep[currentModuleIndex].slug}/${prevModule?.slug}`;
            }
    
            setMessageAlertDialog(saveStep1.message);
            setOpenAlertDialog(true);
          }
    
          console.log(saveStep1);
        }

  };

  return (
    <>
      <Button onClick={handleBackPage} disabled={props.currentPage?.step === 1}>
        <ChevronLeft />
        Kembali
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
