import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { NavQuiz } from "../_component/NavQuiz";
import { Question } from "../_component/Question";
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

export default async function Page({params, searchParams}: Props) {
  //TODO jika menyembunyikan pagination
  const hideNaviation = true

  const getTypeClass = params.type_class;
  let getSection = params.section;
  const getSlug = params.slug;
  // if (getTypeClass === "video-learning") getSection = getSlug;
  const getModuleSlug = params.module;
  const getToken = (params.id as string) || "";
  const getPage = (searchParams.page as string) || "";
  
  const urlFetchQuiz = hideNaviation ? `/classroom/quiz?token=${getToken}` : `/classroom/quiz?token=${getToken}&page=${getPage}`

  const getQuestion: ApiResponse<TQuizData> = await fetchApi(
    urlFetchQuiz
  );

  const urlQuiz = `${process.env.NEXT_PUBLIC_URL}/${getTypeClass}/${getSlug}/${getSection}/${getModuleSlug}`;

  const optionsQuiz = {
    redirectPagination: `${urlQuiz}/quiz/${getToken}`,
    redirectCompleted: urlQuiz,
    pathType: `quiz`,
  };

  if (!getQuestion || (getQuestion && !getQuestion.success)) {
    notFound();
  }

  return (
    <>
      <NavQuiz
        hideNavigation={hideNaviation}
        options={optionsQuiz}
        completed={getQuestion.data?.quiz.completed || 0}
        time={getQuestion.data?.quiz.timeLimit || ""}
        title={getQuestion.data?.quiz.title || ""}
        totalQuestion={getQuestion.data?.quiz.totalQuestion || 0}
        pagination={getQuestion.data?.pagination}
      >
        <Question
          hideNavigation={hideNaviation}
          options={optionsQuiz}
          quizData={getQuestion.data}
          question={getQuestion.data?.question}
          eventType={getQuestion.data?.quiz.eventType || ""}
        />
      </NavQuiz>
    </>
  );
}
