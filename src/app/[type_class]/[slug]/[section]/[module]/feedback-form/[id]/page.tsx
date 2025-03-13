import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { FeedbackForm } from "./_component/FeedbackForm";
import { notFound } from "next/navigation";
import { z } from "zod";
import { formFeedbackSchema } from "@/schemas/formFeedback";

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
  //   type TFormFeedback = {
  //     position: number;
  //     type: string;
  //     title: string;
  //     name: string;
  //     required: boolean;
  //     value: any;
  //     [key: string]: any; // Add this line to define an index signature
  //   };

  // const showFormFeedback: TFormFeedback[] = [
  //   {
  //     position: 1,
  //     type: "RATING",
  //     title:
  //       "Seberapa puas kamu dengan pengajar ? (makin besar angka, semakin bagus penilaian) *",
  //     name: "rating_pengajar",
  //     required: true,
  //     value: undefined,
  //   },
  //   {
  //     position: 2,
  //     type: "TEXT",
  //     title: "Kritik & saran untuk Trainer *",
  //     name: "saran_trainer",
  //     required: true,
  //     value: undefined,
  //   },
  //   {
  //     position: 3,
  //     type: "CHECKBOX",
  //     title:
  //       "Aspek apa yang paling kamu suka dari pelayanan Mindo Education? *",
  //     name: "aspek",
  //     required: true,
  //     value: [
  //       {
  //         id: "1",
  //         label: "test",
  //       },
  //       {
  //         id: "2",
  //         label: "test2",
  //       },
  //     ],
  //   }
  // ];

  const getEvaluationQuestion: ApiResponse<TFormFeedback> = await fetchApi(
    `/evaluation/${params.id}/feedback`
  );

  if (
    !getEvaluationQuestion ||
    (getEvaluationQuestion && !getEvaluationQuestion.success)
  )
    notFound();

  const showFormFeedback: TFormFeedback["formFeedback"] =
    getEvaluationQuestion.data?.formFeedback || [];

  console.log(getEvaluationQuestion.data);

  const formattedFeedback = showFormFeedback.reduce((acc, item) => {
    acc[item.name] = item.type === "CHECKBOX" ? [] : "";
    return acc;
  }, {} as Record<string, string | string[]>);

  // type FormFeedbackType = z.infer<typeof dynamicSchema>;

  return (
    <>
      <FeedbackForm
        evaluationId={params.id}
        feedbackUserId={getEvaluationQuestion.data?.feetbackUser[0].id.toString() || ""}
        dataFormFeedback={formattedFeedback}
        showFormFeedback={showFormFeedback}
        // formFeedbackSchema={dynamicSchema}
        baseUrl={`${process.env.NEXT_PUBLIC_URL}/${getTypeClass}/${getSlug}/${getSection}/${getModuleSlug}`}
      />
    </>
  );
}
