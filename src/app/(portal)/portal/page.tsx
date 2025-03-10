import { Metadata } from "next";
import { Portal } from "./_component/Portal";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";
import { getAuthToken, setAuthToken, setCookieToken } from "@/lib/action/auth";
import { cookies } from "next/headers";
import { convertSnakeToKebab } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mindo Class | Redirect",
};

type Props = {
  params: {
    [key: string]: string;
  };
  searchParams: {
    [key: string]: string;
  };
};

export default async function Page({ searchParams }: Props) {
  const getToken = searchParams.token || "";
  const createToken: ApiResponse<TCreateToken> = await fetchApi(
    `/auth/create-access-token?token=${getToken}`,
    {
      method: "POST",
    }
  );

  if (createToken && !createToken.success) notFound();

  const getCurrentPage: ApiResponse<TCurrentPage> = await fetchApi(
    `/user-class/current-step`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${createToken.data?.accessToken}`,
      },
    }
  );

  if(getCurrentPage && !getCurrentPage.success) notFound()
  
  const getDataCurrentPage = getCurrentPage.data;
  
  if(!getDataCurrentPage?.checkCurrentPage){
    const saveStep:ApiResponse = await fetchApi(`/classroom/save-step`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${createToken.data?.accessToken}`,
      },
      body: {
        moduleId: getCurrentPage.data?.module.id,
        status: "OPEN"
    }
    })
    if(saveStep && !saveStep.success) notFound()
  }

  const url = `${process.env.NEXT_PUBLIC_URL}/${
    convertSnakeToKebab(getDataCurrentPage?.typeClass as string)
  }/${getDataCurrentPage?.classSlug}/${
    getDataCurrentPage?.typeClass === "VIDEO_LEARNING"
      ? getDataCurrentPage?.sectionSlug
      : "section"
  }/${getDataCurrentPage?.module.slug}`;  

  return (
    <div>
      <Portal redirectUrl={url} token={createToken.data?.accessToken} />
    </div>
  );
}
