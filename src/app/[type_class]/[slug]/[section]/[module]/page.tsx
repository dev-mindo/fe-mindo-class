import { Metadata } from "next";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";
import { ModuleVideo } from "./_component/video/ModuleVideo";
import { ModuleMaterial } from "./_component/ModuleMaterial";
import { AttemptQuiz } from "./quiz/_component/AttemptQuiz";
import { Discussion } from "./_component/Discussion";
import Evaluation from "./_component/evaluation/Evaluation";
import { Certificate } from "./_component/Certificate";
import { Task } from "./_component/Task";
import { ModuleLiveVideo } from "./_component/live/ModuleLiveVideo";
import { IAlertDialog } from "@/components/base/IAlertDialog";

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
  const fetchClass = await fetchApi(
    `/classroom/${getSection}/${getModuleSlug}`
  );
  const getModule = fetchClass as ApiResponse<TModuleMaterial>;    

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
        // if ((quiz && !quiz.success) || !quiz) notFound();
        return (
          <AttemptQuiz quiz={quiz?.data} params={params} baseUrl={baseUrl} />
        );
      case "DISCUSSION":
        const discussion = await fetchApi(`/discussion/${getModule.data.id}`);
        return (
          <Discussion
            moduleId={getModule.data.id}
            discussionData={discussion}
            baseUrl={baseUrl}
          />
        );
      case "TASK":
        const getAssignment: ApiResponse<TAssignment> = await fetchApi(
          `/assignment/${getModule.data.id}`
        );
        return (
          <Task
            intruction={getModule.data.description}
            intructionLink={getModule.data.file}
            assignment={getAssignment.data}
          />
        );
      case "LIVE":
        return <ModuleLiveVideo materialData={getModule.data} />;
      case "EVALUATION":        
        const getAttemptQuiz: ApiResponse<TEvaluationAttemptQuiz> =
          await fetchApi(`/attempt-quiz/result/${getSection}`);
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
        return <Certificate />;
    }
  }

  if (getModule.statusCode === 404 && getModule.errorCode !== "NOT_FOUND") {
    const getFetchRedirect = fetchClass as ApiResponse<TModuleRedirect>;
    if (getModule.message === "ERR_CLASS_NOT_FOUND") {
      return (
        <IAlertDialog
          isOpen={true}
          message="Data kelas Tidak Ditemukan"
          title="Informasi"
          redirectUrl={process.env.NEXT_PUBLIC_MINDO_MY_CLASS}
          buttonText="Kembali ke kelas saya"
        />
      );
    }

    const getRedirectData = getFetchRedirect.data;

    return (
      <IAlertDialog
        isOpen={true}
        message={getModule.message}
        title="Error Info"
        redirectUrl={`${process.env.NEXT_PUBLIC_URL}/${getRedirectData?.classType}/${getRedirectData?.classSlug}/${getRedirectData?.sectionSlug}/${getRedirectData?.moduleSlug}`}
      />
    );
  } else {
    return (
      <IAlertDialog
        isOpen={true}
        message={getModule.message}
        title="Error Info"
      />
    );
  }

  notFound();
}
