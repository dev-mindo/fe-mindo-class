"use client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { convertTimeToWords } from "@/lib/utils";
import Link from "next/link";
import { ErrorDialogAttempt } from "./ErrorDialogAttempt";
import { toast } from "sonner";

type Props = {
  quiz: TQuizAll;
  errorMessage?: string;
  params: {
    [key: string]: string;
  };
  baseUrl: string;
};

export const AttemptQuiz = ({ quiz, errorMessage, baseUrl }: Props) => {
  const [isOpenErrorAttempt, setIsOpenErrorAttempt] = useState(false);
  const [errorMessageAttempt, setMessageAttempt] = useState("");
  const [attemptLoading, setAttemptLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage, {
        id: "quiz-not-available",
      });
    }
  }, [errorMessage]);

  const attemptQuiz = async () => {
    if (!quiz) {
      toast.error(
        errorMessage || "Quiz belum tersedia dan belum dapat dikerjakan.",
        {
          id: "quiz-not-available",
        }
      );
      return;
    }

    setAttemptLoading(true);
    const attempt: ApiResponse = await fetchApi(`/attempt-quiz/${quiz.id}`, {
      method: "POST",
    });
    if (attempt.success) {
      router.push(`${baseUrl}/quiz/${attempt.data.signatureQuiz}?page=1`);
    } else {
      setIsOpenErrorAttempt(true);
      setMessageAttempt(attempt.message);
      setAttemptLoading(false);
    }
  };

  if (!quiz) {
    return (
      <div className="mx-auto w-full md:w-[90%] xl:w-[80%]">
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Quiz belum dapat dikerjakan</AlertTitle>
          <AlertDescription>
            {errorMessage ||
              "Quiz belum tersedia dan belum dapat dikerjakan."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mx-auto w-[100%] md:w-[90%] xl:w-[80%]">
        <h1>{quiz?.title}</h1>
        <div className="mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              Soal Berjumlah {quiz._count.question} soal dengan waktu{" "}
              {convertTimeToWords(quiz.limitTime)}
            </AlertDescription>
          </Alert>
          <Table className="my-4">
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader>
              <TableRow>
                <TableHead>Jumlah Percobaan Quiz</TableHead>
                <TableHead>Total Benar</TableHead>
                <TableHead>Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quiz.quizAttempt.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    Percobaan ke {index + 1}
                  </TableCell>
                  <TableCell>
                    {item.onProcess ? 0 : item._count.UserAnswer}
                  </TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>
                    {item.onProcess ? (
                      <Button asChild>
                        <Link href={`${baseUrl}/quiz/${item.signatureQuiz}`}>
                          Lanjutkan
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild>
                        <Link href={`${baseUrl}/quiz/evaluation/${item.id}`}>
                          Evaluasi
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <div className="my-2">
              <Button
                disabled={attemptLoading}
                onClick={attemptQuiz}
              >
                {attemptLoading ? (
                  <>
                    <Loader2 className="animate-spin" /> Please wait
                  </>
                ) : (
                  "Mulai Quiz"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <ErrorDialogAttempt
        setIsOpen={setIsOpenErrorAttempt}
        message={errorMessageAttempt}
        isOpen={isOpenErrorAttempt}
        title=""
      />
    </div>
  );
};
