import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { NavQuiz } from "./_component/NavQuiz";
import { Question } from "./_component/Question";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Mindo Class | Attempt Quiz",
};

export type TQuizData = {
  status: string;
  quiz: {
    title: string;
    completed: number;
    totalQuestion: number;
    timeLimit: string;
    eventType: string;
  };
  pagination: {
    next: number;
    back: number;
    current: number;
    page: Array<{
      number: number;
      current: boolean;
      completed: boolean;
    }>;
  };
  question: {
    id: number;
    image: string;
    questionText: string;
    userAnswer: Array<any>;
    Answer: Array<{
      id: number;
      answerText: string;
    }>;
  };
};

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
};

export default async function Page(props: Props) {
  const getToken = (props.params.id as string) || "";
  const getPage = (props.searchParams.page as string) || "";
  const getQuestion: ApiResponse<TQuizData> = await fetchApi(
    `/classroom/product-slug/quiz?token=${getToken}&page=${getPage}`
  );

  if (!getQuestion || (getQuestion && !getQuestion.success)) {
    notFound();
  }

  return (
    <>
      <NavQuiz
        completed={getQuestion.data?.quiz.completed || 0}
        time={getQuestion.data?.quiz.timeLimit || ""}
        title={getQuestion.data?.quiz.title || ""}
        totalQuestion={getQuestion.data?.quiz.totalQuestion || 0}
        pagination={getQuestion.data?.pagination}
      >
        <Question
          quizData={getQuestion.data}
          question={getQuestion.data?.question}
          eventType={getQuestion.data?.quiz.eventType || ""}
        />
      </NavQuiz>
    </>
  );
}
