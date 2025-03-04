import { Metadata } from "next";
import { NavQuiz } from "../../[id]/_component/NavQuiz";
import { Question } from "../../[id]/_component/Question";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";

export const metadata: Metadata = {
  title: "Mindo Class | Evaluation Quiz",
};

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
};

export default async function Page({ params, searchParams }: Props) {
  const getSlug = (params.slug as string) || "";
  const getType = (params.type as string) || "";
  const getAttemptId = (params.id as string) || "";
  const getPage = (searchParams.page as string) || "";
  const getQuestion: ApiResponse<TQuizData> = await fetchApi(
    `/attempt-quiz/${getSlug}/quiz/${getType}/evaluation/${getAttemptId}?page=${getPage}`
  );

  const urlQuiz = `${process.env.NEXT_PUBLIC_URL}/video-learning/${getSlug}/quiz/${getType}`;

  const optionsQuiz = {
    redirectPagination: `${urlQuiz}/evaluation/${getAttemptId}`,
    redirectCompleted: urlQuiz,
    pathType: `evaluation`,
  };

  return (
    <NavQuiz
      resultQuiz={{
        score: getQuestion.data?.quiz.score || 0,
        totalCorrect: getQuestion.data?.quiz.totalCorrect || 0,
      }}
      options={optionsQuiz}
      completed={getQuestion.data?.quiz.completed || 0}
      time={getQuestion.data?.quiz.timeLimit || ""}
      title={getQuestion.data?.quiz.title || ""}
      totalQuestion={getQuestion.data?.quiz.totalQuestion || 0}
      pagination={getQuestion.data?.pagination}
    >
      <Question
        options={optionsQuiz}
        quizData={getQuestion.data}
        question={getQuestion.data?.question}
        eventType={getQuestion.data?.quiz.eventType || ""}
      />
    </NavQuiz>
  );
}
