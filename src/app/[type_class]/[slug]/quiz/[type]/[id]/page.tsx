import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { NavQuiz } from "./_component/NavQuiz";
import { Question } from "./_component/Question";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Mindo Class | Attempt Quiz",
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
  const getSlug = (props.params.slug as string) || "";
  const getType = (props.params.type as string) || "";
  const getToken = (props.params.id as string) || "";
  const getPage = (props.searchParams.page as string) || "";
  const getQuestion: ApiResponse<TQuizData> = await fetchApi(
    `/classroom/product-slug/quiz?token=${getToken}&page=${getPage}`
  );

  const urlQuiz = `${process.env.NEXT_PUBLIC_URL}/video-learning/${getSlug}/quiz/${getType}`

  const optionsQuiz = {
    redirectPagination: `${urlQuiz}/${getToken}`,
    redirectCompleted: urlQuiz,
    pathType: `quiz`,
  };

  if (!getQuestion || (getQuestion && !getQuestion.success)) {
    notFound();
  }

  return (
    <>
      <NavQuiz
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
    </>
  );
}
