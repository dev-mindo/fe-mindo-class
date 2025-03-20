"use client";
import Countdown from "@/components/base/ICountDown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDurationTimeNow } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AlertTimeEnd } from "../[id]/_component/AlertTimeEnd";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { AlertDialogCompleted } from "../[id]/_component/AlertDialogCompleted";
import { clearCachesByServerAction } from "@/lib/action/quiz";

type Props = {
  title: string;
  completed: number;
  totalQuestion: number;
  time: string;
  children: React.ReactNode;
  pagination: TQuizData["pagination"] | undefined;
  resultQuiz?: {
    score: number;
    totalCorrect: number;
  };
  options: {
    redirectPagination: string;
    redirectCompleted: string;
    pathType: string;
  };
};

export function NavQuiz({
  completed,
  totalQuestion,
  title,
  children,
  time,
  pagination,
  options,
  resultQuiz,
}: Props) {
  const params = useParams<{
    slug: string;
    type: string;
    id: string;
  }>();
  const [selectedAnswer, setSelectedAnswer] = useState<{
    questionId: number;
    answerId: number;
  }>({
    questionId: 0,
    answerId: 0,
  });
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [IsOpenDialogCompleted, setIsOpenDialogCompleted] =
    useState<boolean>(false);
  const [targetTime, setTargetTime] = useState<string>("00:00:00");
  const [isOpenAlertTimeEnd, setIsOpenAlertTimeEnd] = useState<boolean>(false);
  const [alertMessageTimeEnd, setAlertMessageTimeEnd] = useState<{
    title: string;
    message: string;
  }>({
    title: "",
    message: "",
  });

  function handlePagination(page: number | undefined = 1) {
    router.push(options.redirectPagination + `?page=${page}`);
  }

  async function handleBackAnswer() {
    handlePagination(pagination?.back);
  }

  async function handleNextAnswer() {
    if (options.pathType === "quiz") {
      if (selectedAnswer.questionId !== 0 && selectedAnswer.answerId !== 0) {
        setLoading(true);
        //save answer
        const resAnswer: ApiResponse = await fetchApi(
          `/classroom/quiz?token=${params.id}`,
          {
            method: "POST",
            body: {
              ...selectedAnswer,
            },
          }
        );
        if (resAnswer && !resAnswer.success) {
          toast.error(`Error Code ${resAnswer.errorCode}`, {
            description: resAnswer.message,
          });
        }
        setLoading(false);
        clearCachesByServerAction(
          options.redirectPagination + `?page=${pagination?.next}`
        );
      }
    }
    if (
      pagination?.current ===
      pagination?.page[pagination.page.length - 1].number
    ) {
      if (options.pathType === "quiz") {
        setIsOpenDialogCompleted(true);
      } else {
        router.push(options.redirectCompleted);
      }
    } else {
      if (!loading) {
        handlePagination(pagination?.next);
      }
    }
  }

  function HandleRedirectTimeEnd() {
    router.push(options.redirectCompleted);
  }

  function setAlertTime(time: number) {
    // console.log("waktu tinggal : ", time);
    toast.warning(`Sisa waktu tinggal ${time} Menit Lagi`, {
      position: "top-center",
    });
  }

  function setTimeEnd() {
    setAlertMessageTimeEnd({
      title: "Waktu habis!",
      message:
        "Waktu sudah habis dan jawaban anda tersimpan, klik untuk melanjutkan",
    });
    setIsOpenAlertTimeEnd(true);
  }

  async function handleCompletedQuiz() {
    console.log("completed");
    const resCompleted: ApiResponse = await fetchApi(
      `/classroom/quiz/completed?token=${params.id}`,
      {
        method: "POST",
      }
    );
    console.log(resCompleted);
    if (resCompleted && resCompleted.success) {
      router.push(options.redirectCompleted);
    }
  }

  useEffect(() => {
    const getTargetTime = getDurationTimeNow(time);
    setTargetTime(getTargetTime);
    console.log("time", getTargetTime);
  }, [time]);

  return (
    <div className="flex flex-col lg:justify-between h-screen">
      <div className="flex flex-col sm:flex-row items-center bg-sidebar">
        <div className="mr-2 mr-auto w-0 lg:w-fit">
          {options.pathType !== "quiz" && (
            <Button
              onClick={() => {
                router.push(options.redirectCompleted);
              }}
              variant="ghost"
            >
              <ChevronLeft />
              Kembali
            </Button>
          )}
        </div>
        <div className="flex flex-col lg:flex-row justify-center items-center lg:h-16 p-4 w-full lg:justify-between">
          <div className="flex items-center">
            <h1 className="mb-4 lg:mb-0">{title}</h1>
          </div>
          <div className="flex gap-10 items-center lg:w-[35%] xl:w-[20%] mr-4">
            {options.pathType === "evaluation" && (
              <div>
                <div>
                  Jawaban Benar {resultQuiz?.totalCorrect || 0}/{totalQuestion}
                </div>
                <div>Score {resultQuiz?.score || 0}/100</div>
              </div>
            )}
            <div className="lg:ml-auto">
              Menyelesaikan {completed}/{totalQuestion}
              <div className="w-[100%] mt-2">
                <Progress
                  value={Math.round((100 / totalQuestion) * completed) || 1}
                />
              </div>
            </div>
            {options.pathType === "quiz" && (
              <div>
                {targetTime !== "00:00:00" ? (
                  <Countdown
                    setAlertTime={setAlertTime}
                    setTimeEnd={setTimeEnd}
                    targetTime={targetTime}
                  />
                ) : (
                  targetTime
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-full overflow-y-auto h-[calc(100%-10rem)] bg-[url(/image/background_quiz.png)] bg-[auto_100vh] bg-center bg-no-repeat">
        <div className="mx-auto w-[95%] my-10">
          {children && typeof children === "object"
            ? React.cloneElement(children as React.ReactElement, {
                onDataFromQuestion: setSelectedAnswer,
                onSelectedPagination: handlePagination,
              })
            : children}
        </div>
      </div>
      <div className="flex justify-between items-center bg-sidebar h-16">
        <div className="ml-8">
          <Button
            onClick={handleBackAnswer}
            disabled={pagination?.current === 1}
          >
            <ChevronLeft />
            Sebelumnya
          </Button>
        </div>
        <div className="mr-8">
          <Button onClick={handleNextAnswer} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Please wait
              </>
            ) : pagination?.current ===
              pagination?.page[pagination.page.length - 1].number ? (
              "Selesai"
            ) : (
              "Selanjutnya"
            )}
            <ChevronRight />
          </Button>
        </div>
      </div>
      <AlertTimeEnd
        isOpen={isOpenAlertTimeEnd}
        message={alertMessageTimeEnd.message}
        title={alertMessageTimeEnd.title}
        handleRedirectUrl={handleCompletedQuiz}
      />
      <AlertDialogCompleted
        isOpen={IsOpenDialogCompleted}
        handleCompletedQuiz={handleCompletedQuiz}
        setIsOpen={setIsOpenDialogCompleted}
      />
    </div>
  );
}
