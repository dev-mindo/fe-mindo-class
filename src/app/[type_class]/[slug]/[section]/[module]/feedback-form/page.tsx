import { FeedbackForm } from "./_component/FeedbackForm";

export default async function Page() {
  //   type TFormFeedback = {
  //     position: number;
  //     type: string;
  //     title: string;
  //     name: string;
  //     required: boolean;
  //     value: any;
  //     [key: string]: any; // Add this line to define an index signature
  //   };

  const showFormFeedback: TFormFeedback[] = [
    {
      position: 1,
      type: "RATING",
      title:
        "Seberapa puas kamu dengan pengajar ? (makin besar angka, semakin bagus penilaian) *",
      name: "rating_pengajar",
      required: true,
      value: undefined,
    },
    {
      position: 2,
      type: "TEXT",
      title: "Kritik & saran untuk Trainer *",
      name: "saran_trainer",
      required: true,
      value: undefined,
    },
    {
      position: 3,
      type: "CHECKBOX",
      title:
        "Aspek apa yang paling kamu suka dari pelayanan Mindo Education? *",
      name: "aspek",
      required: true,
      value: [
        {
          id: "1",
          label: "test",
        },
        {
          id: "2",
          label: "test2",
        },
      ],
    }
  ];

  const formattedFeedback = showFormFeedback.reduce((acc, item) => {
    acc[item.name] = item.type === "CHECKBOX" ? [] : "";
    return acc;
  }, {} as Record<string, string | string[]>);
  

  return (
    <>
      <FeedbackForm dataFormFeedback={formattedFeedback} showFormFeedback={showFormFeedback} />
    </>
  );
}
