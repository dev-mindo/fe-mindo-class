import { Metadata } from "next";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";
import { ModuleVideo } from "./_component/video/ModuleVideo";
import { ModuleMaterial } from "./_component/ModuleMaterial";
import { AttemptQuiz } from "./quiz/_component/AttemptQuiz";

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
  if (getTypeClass === "video-learning") getSection = getSlug;
  const getModuleSlug = params.module;
  const getModule: ApiResponse<TModuleMaterial> = await fetchApi(
    `/classroom/${getSection}/${getModuleSlug}`
  );
  
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/${getTypeClass}/${getSlug}/${getSection}/${getModuleSlug}`

  if (getModule && getModule.success && getModule.data) {
    metadata.title = getModule.data.title;
    switch (getModule.data.type) {
      case "VIDEO":
        return <ModuleVideo materialData={getModule.data} />;
      case "INFO":
        return <ModuleMaterial materialData={getModule.data} />;
      case "MATERIAL":
        return <ModuleMaterial materialData={getModule.data} />;
      case "QUIZ":
        const quiz: ApiResponse<TQuizAll> = await fetchApi(`/quiz/${getModule.data.id}`);
        if ((quiz && !quiz.success) || !quiz) notFound();                
        return <AttemptQuiz quiz={quiz?.data} params={params} baseUrl={baseUrl} />;
      case "DISCUSSION":
        break;
      case "EVALUATION":
        break;
      case "CERTIFICATE":
        break;
    }
  }
    
  notFound();
}
