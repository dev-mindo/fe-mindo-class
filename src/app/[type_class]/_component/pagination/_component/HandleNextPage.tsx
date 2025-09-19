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
    if (!props.dataSection) {
      // Optionally handle the null case, e.g., return early or show an error
      return;
    }
    const getNextStep = props.getPrevNextModule(props.dataSection);

    const currentModuleIndex = getNextStep.findIndex((section) =>
      section.modules.some((module) => module.current)
    );

    const nextModule = getNextStep.at(currentModuleIndex)?.next.at(0);

    let nextUrl = null;

    if (!nextModule) {
      const nextSection = getNextStep.at(currentModuleIndex);

      if (nextSection) {
        const mapSection = props.dataSection
          .filter((sectionItem) => sectionItem.position > nextSection.position)
          .flatMap((sectionItem) => {
            return {
              ...sectionItem,
              modules: sectionItem.modules.filter((moduleItem) => {
                return (
                  moduleItem.status === "OPEN" ||
                  moduleItem.UserModule.at(0)?.status === "DONE" ||
                  !moduleItem.isLocked
                );
              }),
            };
          });

        console.log("mapSection", mapSection);

        if (mapSection.length > 0) {
          const getFirstModule = mapSection.at(0)?.modules.at(0);
          console.log("mapSection", getFirstModule);
          nextUrl = `${props.baseUrl}/${mapSection.at(0)?.slug}/${
            getFirstModule?.slug
          }`;
        }
      }
    }
    console.log("current", props.currentPage);

    //TODO ubah disini
    if (
      nextModule?.status === "DONE" &&
      props.currentPage?.UserModule.at(0)?.status === "DONE"
    ) {
      router.push(
        `${props.baseUrl}/${getNextStep[currentModuleIndex].slug}/${nextModule?.slug}`
      );
    } else if (nextUrl) {
      console.log("nextUrl", nextUrl);
      router.push(nextUrl);
    } else {
      const saveStep1: ApiResponse = await fetchApi(`/classroom/save-step`, {
        method: "POST",
        body: {
          moduleId: props.currentPage?.id,
          status: "DONE",
          navigation: "NEXT",
        },
      });
      if (saveStep1.statusCode === 200) {
        console.log("step1");
        console.log("step next", getNextStep);
        console.log("next module", nextModule);
        const saveStep2: ApiResponse = await fetchApi(`/classroom/save-step`, {
          method: "POST",
          body: {
            moduleId: nextModule?.id,
            status: "OPEN",
            navigation: "NEXT",
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
          setOpenAlertDialog(true);
          if (
            saveStep2.statusCode === 403 &&
            saveStep2.errorCode === "ERR_PAGE_MODULES_FORBIDEN" &&
            saveStep2.data &&
            saveStep2.data.sectionSlug
          ) {
            setMessageAlertDialog(
              `Page ${nextModule?.title} tidak dapat diakses`
            );

            setRedirectUrl(
              `${props.baseUrl}/${saveStep2.data.sectionSlug}/${saveStep2.data.moduleSlug}`
            );
          } else {
            setMessageAlertDialog(saveStep2.message);
            setRedirectUrl(
              `${props.baseUrl}/${props.currentPage?.sectionSlug}/${props.currentPage?.slug}`
            );
          }
        }
      } else {
        if (
          saveStep1.statusCode === 403 &&
          saveStep1.errorCode === "ERR_PAGE_MODULES_FORBIDEN"
        ) {
          setMessageAlertDialog(
            `Page ${nextModule?.title} tidak dapat diakses`
          );
          setRedirectUrl(
            `${props.baseUrl}/${saveStep1.data.sectionSlug}/${saveStep1.data.moduleSlug}`
          );
        } else {
          setMessageAlertDialog(saveStep1.message);
          setRedirectUrl(
            `${props.baseUrl}/${props.currentPage?.sectionSlug}/${props.currentPage?.slug}`
          );
        }

        setOpenAlertDialog(true);
      }

      console.log(saveStep1);
    }
  };

  return (
    <>
      <Button onClick={handleNextPage} disabled={props.currentPage?.isLast}>
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
