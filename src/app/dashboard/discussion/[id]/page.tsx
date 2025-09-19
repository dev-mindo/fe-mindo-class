import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { DetailDiscussion } from "./_component/DetailDiscussion";

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
};

//TODO sertakan product id
const Page = async ({ params }: Props) => {
  const detailDiscussion: ApiResponse<TDetailDiscussion> = await fetchApi(
    `/admin/discussion/detail/${params.id}`
  );

  return <DetailDiscussion detailDiscussionDataProps={detailDiscussion.data} />;
};

export default Page;
