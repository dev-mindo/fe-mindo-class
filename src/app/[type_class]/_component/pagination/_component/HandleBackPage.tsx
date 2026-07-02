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

    let getPrevStep = props.getPrevNextModule(props.dataSection);

    console.log("getPrevStep", getPrevStep);

    console.log("data section", props.dataSection);

    const currentModuleIndex = getPrevStep.findIndex((section) =>
      section.modules.some((module) => module.current)
    );

    console.log("currentModuleIndex", currentModuleIndex);

    let prevModule = getPrevStep.at(currentModuleIndex)?.previous.at(0);


    console.log("prevModule data",prevModule);

    let prevUrl = null

    if (!prevModule) {

      const prevSection = getPrevStep.at(currentModuleIndex);

      if (prevSection) {
        const mapSection = props.dataSection
          .filter((sectionItem) => sectionItem.position < prevSection.position)
          .flatMap((sectionItem) => {
            return {
              ...sectionItem,
              modules: sectionItem.modules.filter((moduleItem) => {
                return (
                  moduleItem.UserModule.at(0)?.status === "OPEN" ||
                  moduleItem.UserModule.at(0)?.status === "DONE" ||
                  !moduleItem.isLocked
                );
              }),
            };
          });

          if(mapSection.length > 0) {
            const getLastSection = mapSection.at(-1);
            const getLastModule = getLastSection?.modules.at(-1);
            console.log("mapSection", getLastModule);            
            prevUrl = `${props.baseUrl}/${getLastSection?.slug}/${getLastModule?.slug}`;
          }
      }
    }

    if (prevModule?.status === "DONE") {      
      router.push(`${props.baseUrl}/${getPrevStep.at(currentModuleIndex)?.slug}/${prevModule.slug}`);      
    } else if(prevUrl) {
      router.push(prevUrl);      
    }else {
      const saveStep1: ApiResponse = await fetchApi(`/classroom/save-step`, {
        method: "POST",
        body: {
          moduleId: props.currentPage?.id,
          status: "DONE",
          navigation: "PREV",
        },
      });
      if (saveStep1.statusCode === 200) {
        const saveStep2: ApiResponse = await fetchApi(`/classroom/save-step`, {
          method: "POST",
          body: {
            moduleId: prevModule?.id,
            status: "OPEN",
            navigation: "PREV",
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
            setMessageAlertDialog(
              `Page ${
                prevModule?.title ? prevModule?.title : ""
              } tidak dapat diakses`
            );
          } else {
            setRedirectUrl(
              `${props.baseUrl}/${props.currentPage?.sectionSlug}/${props.currentPage?.slug}`
            );
            setMessageAlertDialog(saveStep1.message);
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
          setMessageAlertDialog(
            `Page ${
              prevModule?.title ? prevModule?.title : ""
            } tidak dapat diakses`
          );
        } else {
          setRedirectUrl(
            `${props.baseUrl}/${props.currentPage?.sectionSlug}/${props.currentPage?.slug}`
          );
          setMessageAlertDialog(saveStep1.message);
        }
        setOpenAlertDialog(true);
      }

      console.log(saveStep1);
    }
  };

  return (
    <>
      <Button onClick={handleBackPage} disabled={props.currentPage?.isFirst}>
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
