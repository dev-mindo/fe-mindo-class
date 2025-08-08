import { DetailDiscussion } from "@/app/[type_class]/[slug]/[section]/[module]/detail-discussion/[id]/_component/DetailDiscussion";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";

type Props = {
    params: {
      [key: string]: string;
    };
    searchParams: {
      [key: string]: string;
    };
  };

const Page = async ({params}: Props) => {
  const detailDiscussion: ApiResponse<TDetailDiscussion> = await fetchApi(
    `/discussion/detail/${params.id}`
  );  

  return <DetailDiscussion detailDiscussionDataProps={detailDiscussion.data} />;
};

export default Page;
