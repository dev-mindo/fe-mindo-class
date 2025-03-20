import { Metadata } from "next";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";
import { ModuleVideo } from "./_component/video/ModuleVideo";
import { ModuleMaterial } from "./_component/ModuleMaterial";
import { AttemptQuiz } from "./quiz/_component/AttemptQuiz";
import { Discussion } from "./_component/Discussion";
import Evaluation from "./_component/evaluation/Evaluation";
import { Certificate } from "./_component/Certificate";

export const metadata: Metadata = {
  title: "Mindo Class | Module",
};

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
};

export default async function Page({ params }: Props) {
  const getTypeClass = params.type_class;
  let getSection = params.section;
  const getSlug = params.slug;
  // if (getTypeClass === "video-learning") getSection = getSlug;
  const getModuleSlug = params.module;
  const getModule: ApiResponse<TModuleMaterial> = await fetchApi(
    `/classroom/${getSection}/${getModuleSlug}`
  );

  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/${getTypeClass}/${getSlug}/${getSection}/${getModuleSlug}`;

  if (getModule && getModule.success && getModule.data) {
    metadata.title = `Mindo Class | ${params.module}`;
    switch (getModule.data.type) {
      case "VIDEO":
        return <ModuleVideo materialData={getModule.data} />;
      case "INFO":
        return <ModuleMaterial materialData={getModule.data} />;
      case "MATERIAL":
        return <ModuleMaterial materialData={getModule.data} />;
      case "QUIZ":
        const quiz: ApiResponse<TQuizAll> = await fetchApi(
          `/quiz/${getModule.data.id}`
        );
        if ((quiz && !quiz.success) || !quiz) notFound();
        return (
          <AttemptQuiz quiz={quiz?.data} params={params} baseUrl={baseUrl} />
        );
      case "DISCUSSION":
        return <Discussion />;
      case "EVALUATION":
        console.log(getModule.data);
        const getAttemptQuiz: ApiResponse<TEvaluationAttemptQuiz> = await fetchApi(`/attempt-quiz/result/${getSection}`)        

        return (
          <Evaluation
            evaluationAttemptQuiz={getAttemptQuiz.data}
            baseUrl={baseUrl}
            title={getModule.data.title}
            description={getModule.data.description}
            evaluation={getModule.data.evaluation}
          />
        );
      case "CERTIFICATE":
        //TODO bikin page sertifikat
        return <Certificate/>        
    }
  }

  notFound();
}
