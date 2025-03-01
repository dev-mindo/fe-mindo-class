"use client";
import Countdown from "@/components/base/ICountDown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getDurationTimeNow } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { AlertTimeEnd } from "./AlertTimeEnd";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { TQuizData } from "../page";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { AlertDialogCompleted } from "./AlertDialogCompleted";

type Props = {
  title: string;
  completed: number;
  totalQuestion: number;
  time: string;
  children: React.ReactNode;
  pagination: TQuizData["pagination"] | undefined;
};

export function NavQuiz({
  completed,
  totalQuestion,
  title,
  children,
  time,
  pagination,
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
    const pageUrl = `${process.env.NEXT_PUBLIC_URL}/video-learning/${params.slug}/quiz/${params.type}/${params.id}?page=${page}`;
    router.push(pageUrl);
  }

  async function handleBackAnswer() {
    handlePagination(pagination?.back);
  }

  async function handleNextAnswer() {    
    if (selectedAnswer.questionId !== 0 && selectedAnswer.answerId !== 0) {
      setLoading(true);
      const resAnswer: ApiResponse = await fetchApi(
        `/classroom/${params.slug}/quiz?token=${params.id}`,
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
      if (
        pagination?.current ===
        pagination?.page[pagination.page.length - 1].number
      ) {
        setIsOpenDialogCompleted(true);      
        console.log(true)  
      }
      setLoading(false);
    }
    if (!loading) {
      handlePagination(pagination?.next);
    }
  }

  function HandleRedirectTimeEnd() {
    router.push(`/video-learning/${params.slug}/quiz/${params.type}`);
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
    console.log('completed')
    const resCompleted: ApiResponse = await fetchApi(
      `/classroom/completed?token=${params.id}`,
      {
        method: 'POST'
      }
    );
    console.log(resCompleted)
    if (resCompleted && resCompleted.success) {
      router.push(`/video-learning/${params.slug}/quiz/${params.type}`);
    }
  }

  useEffect(() => {
    const getTargetTime = getDurationTimeNow(time);
    setTargetTime(getTargetTime);
    console.log("time", getTargetTime);
  }, [time]);

  return (
    <div className="flex flex-col justify-between h-screen">
      <div className="flex items-center bg-sidebar h-16 p-4 justify-between">
        <div className="flex items-center">
          <div className="mr-2">
            {/* <Button size="icon" variant="ghost">
              <ChevronLeft />
            </Button> */}
          </div>
          <h1>{title}</h1>
        </div>
        <div className="flex gap-10 w-[20%] mr-4">
          <div className="ml-auto">
            Menyelesaikan {completed}/{totalQuestion}
            <div className="w-[100%] mt-2">
              <Progress
                value={Math.round((100 / totalQuestion) * completed) || 1}
              />
            </div>
          </div>
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
        </div>
      </div>
      <div className="h-full">
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
        handleRedirectUrl={HandleRedirectTimeEnd}
      />
      <AlertDialogCompleted
        isOpen={IsOpenDialogCompleted}
        handleCompletedQuiz={handleCompletedQuiz}
        setIsOpen={setIsOpenDialogCompleted}
      />
    </div>
  );
}
