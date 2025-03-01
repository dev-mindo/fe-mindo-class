import { getQuiz } from "@/lib/action/quiz";
import { AttemptQuiz } from "./_component/AttemptQuiz";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";

export const metadata: Metadata = {
  title: 'Mindo Class | Quiz'
}

type Props = {
  params: {
    [key: string]: string
  }
}

const Page = async (props: Props) => {
  const getSlug = props.params.slug as string || ""
  const getType = props.params.type as string || ""
  const quiz: ApiResponse = await fetchApi(`/quiz/${getSlug}/event/${getType}`);
  
  if(quiz && !quiz.success || !quiz){
    notFound()
  }

  return (
    <div>
      <AttemptQuiz quiz={quiz?.data}/>
    </div>
  );
};

export default Page;
