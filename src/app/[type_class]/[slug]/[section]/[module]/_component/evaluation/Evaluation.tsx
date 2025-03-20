"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useRouter } from "next/navigation";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartAttemptQuiz } from "./ChartAttemptQuiz";

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
  const [feedbackDone, setFeedbackDone] = useState(
    (!!evaluation?.feedbackUser && evaluation?.feedbackUser.length > 0) || false
  );

  const [chartAttemptQuiz, setChartAttemptQuiz] = useState<
    | {
        title: string;
        scores: {
          trial: number;
          score: number;
        }[];
      }[]
    | null
  >(null);

  useEffect(() => {
    const scoresArray = evaluationAttemptQuiz?.map((group, index) => ({
      title: group.title,
      scores: group.data.map((attempt, index) => ({
        trial: index + 1,
        score: attempt.score,
      })),
    }));

    console.log(scoresArray);

    setChartAttemptQuiz(scoresArray || null);
  }, [evaluationAttemptQuiz]);

  const handleStartFeedback = async () => {
    // alert("Mulai mengisi feedback...");
    // setFeedbackDone(true);
    const createEvaluation: ApiResponse = await fetchApi(
      `/evaluation/${evaluation?.id}/feedback/attempt`,
      {
        method: "POST",
        body: {},
      }
    );
    if (createEvaluation && createEvaluation.success) {
      router.push(`${baseUrl}/feedback-form/${evaluation?.id}`);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-5 h-screen max-w-[90%] mx-auto">
        <div className="grid grid-cols-2 gap-5">
          {chartAttemptQuiz &&
            chartAttemptQuiz.map((item) => (
              <div className="p-6 bg-card rounded-lg">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {item.title}
                </h2>
                <ChartAttemptQuiz dataChart={item.scores} />
              </div>
            ))}
        </div>
        <div className="p-6 bg-card rounded-lg">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>

          {/* Kata-kata untuk pengguna */}
          <p className="text-gray-600 dark:text-gray-300 mt-2">{description}</p>

          {/* Status Feedback */}
          <div className="mt-4">
            Status Pengisian :
            <Badge
              className="ml-2"
              variant={feedbackDone ? "default" : "destructive"}
            >
              {feedbackDone ? "Sudah Mengisi" : "Belum Mengisi"}
            </Badge>
          </div>

          {/* Tombol Aksi */}

          <Button
            onClick={handleStartFeedback}
            disabled={feedbackDone}
            className="mt-4 w-full"
          >
            Mulai Feedback
          </Button>
        </div>
      </div>
    </>
  );
};

export default Evaluation;
