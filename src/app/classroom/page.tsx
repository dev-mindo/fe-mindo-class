import { Metadata } from "next";
import { Classroom } from "./_component/Classroom";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Mindo Class | Classroom",
};

const Page = async () => {
  const getClassroom: ApiResponse<TClassroom[]> = await fetchApi(`/classroom`)

  if(getClassroom && !getClassroom.success || !getClassroom) notFound()

  return (
    <div className="w-[90%] mx-auto">
      <Classroom 
        dataClassroom={getClassroom.data}
      />
    </div>
  );
};

export default Page;
