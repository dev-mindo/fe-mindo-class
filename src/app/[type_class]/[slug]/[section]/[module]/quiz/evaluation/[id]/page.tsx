import { Metadata } from "next";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { NavQuiz } from "../../_component/NavQuiz";
import { Question } from "../../_component/Question";

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
  const getTypeClass = params.type_class;
  let getSection = params.section;
  const getSlug = params.slug;
  // if (getTypeClass === "video-learning") getSection = 'section';
  const getModuleSlug = params.module;
  const getAttemptId = (params.id as string) || "";
  const getPage = (searchParams.page as string) || "";
  const getQuestion: ApiResponse<TQuizData> = await fetchApi(
    `/attempt-quiz/evaluation/${getAttemptId}?page=${getPage}`
  );

  const urlQuiz = `${process.env.NEXT_PUBLIC_URL}/${getTypeClass}/${getSlug}/${getSection}/${getModuleSlug}`;

  const optionsQuiz = {
    redirectPagination: `${urlQuiz}/quiz/evaluation/${getAttemptId}`,
    redirectCompleted: urlQuiz,
    pathType: `evaluation`,
  };

  return (
    <NavQuiz
      hideNavigation={false}
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
        hideNavigation={false}
        options={optionsQuiz}
        quizData={getQuestion.data}
        question={getQuestion.data?.question}
        eventType={getQuestion.data?.quiz.eventType || ""}
      />
    </NavQuiz>
  );
}
