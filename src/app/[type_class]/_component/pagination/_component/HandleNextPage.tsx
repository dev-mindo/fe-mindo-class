"use client";

import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { PrevNextModule } from "../pagination";
import { useRouter } from "next/navigation";
import { clearCachesByServerAction } from "@/lib/action/quiz";
import { useEffect, useMemo, useState } from "react";
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

type QuizValidationData = {
  minimumScore?: number | null;
  quizAttempt?: Array<{
    score?: number | null;
    onProcess?: boolean;
    status?: string | null;
  }>;
};

type LiveValidationData = {
  videoLive?: {
    startAt?: string | Date;
    endAt?: string | Date;
  } | null;
};

type NavModule = TNavClass["sectionMenu"][number]["modules"][number];

export const HandleNextPage = (props: Props) => {
  const router = useRouter();
  const [isOpenAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [messageAlertDialog, setMessageAlertDialog] = useState<string>("");
  const [redirectUrl, setRedirectUrl] = useState<string>("");
  const [isCheckingTaskStatus, setIsCheckingTaskStatus] =
    useState<boolean>(false);
  const [isTaskAssessed, setIsTaskAssessed] = useState<boolean>(true);
  const [isCheckingQuizStatus, setIsCheckingQuizStatus] =
    useState<boolean>(false);
  const [isQuizPassed, setIsQuizPassed] = useState<boolean>(true);
  const [isCheckingLiveStatus, setIsCheckingLiveStatus] =
    useState<boolean>(false);
  const [isLiveInProgress, setIsLiveInProgress] = useState<boolean>(false);

  const isTaskModule = props.currentPage?.type === "TASK";
  const isQuizModule = props.currentPage?.type === "QUIZ";
  const isLiveModule = props.currentPage?.type === "LIVE";
  const hasUserModuleAccess = (moduleItem?: NavModule) => {
    if (!moduleItem) return false;

    const userModuleStatus = moduleItem.UserModule.at(0)?.status;

    return userModuleStatus === "OPEN" || userModuleStatus === "DONE";
  };
  const isNextModuleAlreadyOpen = useMemo(() => {
    if (!props.dataSection) return false;

    const nextSteps = props.getPrevNextModule(props.dataSection);
    const currentModuleIndex = nextSteps.findIndex((section) =>
      section.modules.some((module) => module.current)
    );
    const currentSection = nextSteps.at(currentModuleIndex);
    const nextModule = currentSection?.next.at(0);
    const nextSectionModule = !nextModule
      ? props.dataSection
          .filter(
            (sectionItem) =>
              currentSection && sectionItem.position > currentSection.position
          )
          .flatMap((sectionItem) => sectionItem.modules)
          .find(hasUserModuleAccess)
      : undefined;
    const targetModule = nextModule || nextSectionModule;

    return hasUserModuleAccess(targetModule);
  }, [props]);
  const isNextDisabledByTask =
    !isNextModuleAlreadyOpen &&
    isTaskModule &&
    (isCheckingTaskStatus || !isTaskAssessed);
  const isNextDisabledByQuiz =
    !isNextModuleAlreadyOpen &&
    isQuizModule &&
    (isCheckingQuizStatus || !isQuizPassed);
  const isNextDisabledByLive =
    !isNextModuleAlreadyOpen &&
    isLiveModule &&
    (isCheckingLiveStatus || isLiveInProgress);
  const isNextDisabled =
    Boolean(props.currentPage?.isLast) ||
    isNextDisabledByTask ||
    isNextDisabledByQuiz ||
    isNextDisabledByLive;
  const nextButtonLabel =
    !isNextModuleAlreadyOpen &&
    (isCheckingTaskStatus || isCheckingQuizStatus || isCheckingLiveStatus)
      ? "Memeriksa..."
      : "Selanjutnya";
  const nextButtonTitle = isNextDisabledByTask
    ? "Tombol selanjutnya aktif setelah tugas dinilai"
    : isNextDisabledByQuiz
    ? "Tombol selanjutnya aktif setelah quiz selesai dan score memenuhi minimum"
    : isNextDisabledByLive
    ? "Tombol selanjutnya aktif setelah live selesai"
    : undefined;

  useEffect(() => {
    let isMounted = true;

    const checkTaskStatus = async () => {
      if (!isTaskModule) {
        setIsCheckingTaskStatus(false);
        setIsTaskAssessed(true);
        return;
      }

      if (!props.currentPage?.id) {
        setIsTaskAssessed(false);
        return;
      }

      setIsCheckingTaskStatus(true);

      try {
        const assignment: ApiResponse<TAssignment> = await fetchApi(
          `/assignment/${props.currentPage.id}`
        );
        const taskStatus = assignment.data?.taskUser?.at(0)?.status;

        if (isMounted) {
          setIsTaskAssessed(taskStatus === "ASSESSED");
        }
      } catch (error) {
        console.error("Gagal mengecek status task:", error);
        if (isMounted) {
          setIsTaskAssessed(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingTaskStatus(false);
        }
      }
    };

    checkTaskStatus();

    return () => {
      isMounted = false;
    };
  }, [isTaskModule, props.currentPage?.id]);

  useEffect(() => {
    let isMounted = true;

    const checkQuizStatus = async () => {
      if (!isQuizModule) {
        setIsCheckingQuizStatus(false);
        setIsQuizPassed(true);
        return;
      }

      if (!props.currentPage?.id) {
        setIsQuizPassed(false);
        return;
      }

      setIsCheckingQuizStatus(true);

      try {
        const quiz: ApiResponse<QuizValidationData> = await fetchApi(
          `/quiz/${props.currentPage.id}`
        );
        const minimumScore = Number(quiz.data?.minimumScore ?? 0);
        const attempts = quiz.data?.quizAttempt ?? [];
        const hasPassedAttempt = attempts.some((attempt) => {
          const attemptStatus = attempt.status?.toUpperCase();
          const isOnProcess =
            attempt.onProcess ||
            attemptStatus === "ON_PROCESS" ||
            attemptStatus === "PROCESS" ||
            attemptStatus === "IN_PROGRESS";
          const score = Number(attempt.score ?? 0);

          return !isOnProcess && score >= minimumScore;
        });

        if (isMounted) {
          setIsQuizPassed(Boolean(quiz.success && hasPassedAttempt));
        }
      } catch (error) {
        console.error("Gagal mengecek status quiz:", error);
        if (isMounted) {
          setIsQuizPassed(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingQuizStatus(false);
        }
      }
    };

    checkQuizStatus();

    return () => {
      isMounted = false;
    };
  }, [isQuizModule, props.currentPage?.id]);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const setLiveStatus = (videoLive?: LiveValidationData["videoLive"]) => {
      if (!videoLive?.startAt || !videoLive?.endAt) {
        setIsLiveInProgress(false);
        return;
      }

      const now = new Date();
      const startAt = new Date(videoLive.startAt);
      const endAt = new Date(videoLive.endAt);
      const liveInProgress = now >= startAt && now <= endAt;

      setIsLiveInProgress(liveInProgress);

      if (liveInProgress) {
        const timeUntilLiveEnds = endAt.getTime() - now.getTime() + 1000;
        refreshTimer = setTimeout(() => {
          if (isMounted) {
            setIsLiveInProgress(false);
          }
        }, Math.min(Math.max(timeUntilLiveEnds, 0), 2_147_483_647));
      }
    };

    const checkLiveStatus = async () => {
      if (!isLiveModule) {
        setIsCheckingLiveStatus(false);
        setIsLiveInProgress(false);
        return;
      }

      if (!props.currentPage?.sectionSlug || !props.currentPage?.slug) {
        setIsLiveInProgress(false);
        return;
      }

      setIsCheckingLiveStatus(true);

      try {
        const moduleData: ApiResponse<LiveValidationData> = await fetchApi(
          `/classroom/${props.currentPage.sectionSlug}/${props.currentPage.slug}`
        );

        if (isMounted) {
          setLiveStatus(moduleData.data?.videoLive);
        }
      } catch (error) {
        console.error("Gagal mengecek status live:", error);
        if (isMounted) {
          setIsLiveInProgress(false);
        }
      } finally {
        if (isMounted) {
          setIsCheckingLiveStatus(false);
        }
      }
    };

    checkLiveStatus();

    return () => {
      isMounted = false;
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }
    };
  }, [
    isLiveModule,
    props.currentPage?.sectionSlug,
    props.currentPage?.slug,
  ]);

  const handleNextPage = async () => {
    if (isNextDisabled) {
      return;
    }

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
        const nextAccessibleModule = props.dataSection
          .filter((sectionItem) => sectionItem.position > nextSection.position)
          .flatMap((sectionItem) =>
            sectionItem.modules.map((moduleItem) => ({
              sectionSlug: sectionItem.slug,
              moduleItem,
            }))
          )
          .find(({ moduleItem }) => hasUserModuleAccess(moduleItem));

        if (nextAccessibleModule) {
          nextUrl = `${props.baseUrl}/${nextAccessibleModule.sectionSlug}/${nextAccessibleModule.moduleItem.slug}`;
        }
      }
    }
    console.log("current", props.currentPage);

    if (!nextModule && !nextUrl) {
      setMessageAlertDialog("Halaman berikutnya masih terkunci");
      setRedirectUrl("");
      setOpenAlertDialog(true);
      return;
    }

    //TODO ubah disini
    if (nextModule && hasUserModuleAccess(nextModule)) {
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
        if (!nextModule) {
          setMessageAlertDialog("Halaman berikutnya masih terkunci");
          setRedirectUrl("");
          setOpenAlertDialog(true);
          return;
        }

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
            setRedirectUrl("");
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
          setRedirectUrl("");
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
      <Button
        onClick={handleNextPage}
        disabled={isNextDisabled}
        title={nextButtonTitle}
      >
        {nextButtonLabel}
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
