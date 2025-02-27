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
import { ErrorDialogAttempt } from "./ErrorDialogAttempt";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  quiz: {
    title: string;
    time: string;
    id: number;
  };
};

export const AttemptQuiz = ({ quiz }: Props) => {
  // const {toast} = useToast()
  const [isOpenErrorAttempt, setIsOpenErrorAttempt] = useState(false);
  const [errorMessageAttempt, setMessageAttempt] = useState("");
  const [attemptLoading, setAttemptLoading] = useState<boolean>(false);
  const router = useRouter();
  const attemptQuiz = async () => {
    setAttemptLoading(true);
    const attempt: ApiResponse = await fetchApi(`/attempt-quiz/${quiz.id}`, {
      method: "POST",
    });
    if (attempt.success) {
      router.push(
        `${process.env.NEXT_PUBLIC_URL}/video-learning/food-safety-management-system/quiz/pretest/${attempt.data.signatureQuiz}&page=1`
      );
    } else {
      setIsOpenErrorAttempt(true);
      setMessageAttempt(attempt.message);
      setAttemptLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mx-auto w-[80%]">
        <h1>{quiz.title}</h1>
        <div className="mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              Soal Berjumlah 5 soal dengan waktu 10 menit
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
              <TableRow>
                <TableCell className="font-medium">Percobaan ke 1</TableCell>
                <TableCell>4</TableCell>
                <TableCell>80</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex justify-center">
            <div className="my-2">
              <Button onClick={attemptQuiz}>
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
