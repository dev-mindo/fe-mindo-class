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
import { toast } from "sonner";
import { convertTimeToWords } from "@/lib/utils";
import Link from "next/link";
import { ErrorDialogAttempt } from "./ErrorDialogAttempt";

type Props = {
  quiz: TQuizAll;  
  params: {
    [key: string]: string;
  };
  baseUrl: string
};

export const AttemptQuiz = ({ quiz, params, baseUrl }: Props) => {
  // const {toast} = useToast()
  const [isOpenErrorAttempt, setIsOpenErrorAttempt] = useState(false);
  const [errorMessageAttempt, setMessageAttempt] = useState("");
  const [attemptLoading, setAttemptLoading] = useState<boolean>(false);
  const router = useRouter();

  const attemptQuiz = async () => {
    setAttemptLoading(true);
    const attempt: ApiResponse = await fetchApi(`/attempt-quiz/${quiz?.id}`, {
      method: "POST",
    });
    if (attempt.success) {
      router.push(
        `${baseUrl}/quiz/${attempt.data.signatureQuiz}?page=1`
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
        <h1>{quiz?.title}</h1>
        <div className="mt-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info</AlertTitle>
            <AlertDescription>
              Soal Berjumlah {quiz?._count.question} soal dengan waktu{" "}
              {convertTimeToWords(quiz?.limitTime || "")}
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
              {quiz?.quizAttempt.map((item, index) => (
                <TableRow>
                  <TableCell className="font-medium">
                    Percobaan ke {index + 1}
                  </TableCell>
                  <TableCell>{item._count.UserAnswer}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>
                    <Button asChild>
                      <Link href={`${baseUrl}/quiz/evaluation/${item.id}`}>Evaluasi</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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
