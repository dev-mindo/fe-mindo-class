"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import parse from "html-react-parser";
import { BarChart3, CheckCircle2, ClipboardCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChartAttemptQuiz } from "./ChartAttemptQuiz";
import { toast } from "sonner";

type Props = {
  title: string;
  description: string;
  evaluation: TModuleMaterial["evaluation"];
  baseUrl: string;
  evaluationAttemptQuiz: TEvaluationAttemptQuiz | undefined;
};

const Evaluation = ({
  title,
  description,
  evaluation,
  baseUrl,
  evaluationAttemptQuiz,
}: Props) => {
  const router = useRouter();
  const feedbackDone =
    (!!evaluation?.feedbackUser && evaluation?.feedbackUser.length > 0 && evaluation?.feedbackUser.at(0).done) ||
    false;
  const [isStartingFeedback, setIsStartingFeedback] = useState(false);

  useEffect(() => {
    console.log("data eval", evaluation)    
  }, [])

  const chartAttemptQuiz = useMemo(() => {
    if (!evaluationAttemptQuiz) return null;

    const allAttempts: {
      trial: number;
      score: number;
      groupTitle: string;
    }[] = [];

    evaluationAttemptQuiz.forEach((group) => {
      group.data.forEach((attempt) => {
        allAttempts.push({
          trial: allAttempts.length + 1,
          score: attempt.score,
          groupTitle: group.title,
        });
      });
    });

    return [
      {
        title: "Evaluasi Attempt Quiz",
        scores: allAttempts,
      },
    ];
  }, [evaluationAttemptQuiz]);

  const attemptCount = chartAttemptQuiz?.[0]?.scores.length ?? 0;
  const highestScore =
    chartAttemptQuiz?.[0]?.scores.reduce(
      (currentHighest, attempt) => Math.max(currentHighest, attempt.score),
      0
    ) ?? 0;

  const handleStartFeedback = async () => {
    if (!evaluation?.id) {
      toast.error("Data evaluasi belum tersedia");
      return;
    }

    setIsStartingFeedback(true);

    try {
      const createEvaluation: ApiResponse = await fetchApi(
        `/evaluation/${evaluation.id}/feedback/attempt`,
        {
          method: "POST",
          body: {},
        }
      );

      if (createEvaluation && createEvaluation.success) {
        router.push(`${baseUrl}/feedback-form/${evaluation.id}`);
        return;
      }

      toast.error(createEvaluation?.message || "Gagal memulai feedback");
    } finally {
      setIsStartingFeedback(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
      <Card className="rounded-lg shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xl">{title}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Isi feedback berdasarkan pengalaman belajar pada module ini.
                </p>
              </div>
            </div>
            <Badge
              variant={feedbackDone ? "default" : "secondary"}
              className="w-fit gap-1"
            >
              {feedbackDone ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <ClipboardCheck className="h-3.5 w-3.5" />
              )}
              {feedbackDone ? "Sudah Mengisi" : "Belum Mengisi"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">Total Attempt</p>
            <p className="mt-2 text-2xl font-semibold">{attemptCount}</p>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">Score Tertinggi</p>
            <p className="mt-2 text-2xl font-semibold">{highestScore}</p>
          </div>
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm text-muted-foreground">Status Feedback</p>
            <p className="mt-2 text-base font-semibold">
              {feedbackDone ? "Selesai" : "Menunggu Pengisian"}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Perkembangan Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {chartAttemptQuiz && attemptCount > 0 ? (
              chartAttemptQuiz.map((item) => (
                <div key={item.title} className="min-h-[280px]">
                  <ChartAttemptQuiz dataChart={item.scores} />
                </div>
              ))
            ) : (
              <div className="flex min-h-[260px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
                Belum ada data attempt quiz.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Feedback Module</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-sm max-w-none text-foreground prose-p:my-2">
              {description ? parse(description) : "Tidak ada deskripsi evaluasi."}
            </div>
            <Button
              onClick={handleStartFeedback}
              disabled={feedbackDone || isStartingFeedback || !evaluation?.id}
              className="w-full"
            >
              {isStartingFeedback ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memuat Feedback...
                </>
              ) : feedbackDone ? (
                "Feedback sudah diisi"
              ) : (
                "Mulai Feedback"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Evaluation;
