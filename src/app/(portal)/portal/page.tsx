import { Metadata } from "next";
import { Portal } from "./_component/Portal";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";
import { getAuthToken, setAuthToken, setCookieToken } from "@/lib/action/auth";
import { cookies } from "next/headers";
import { convertSnakeToKebab } from "@/lib/utils";
import { IAlertDialog } from "@/components/base/IAlertDialog";
import { ISonnerServerError } from "@/components/base/ISonnerServerError";

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

  if (createToken && !createToken.success) {
  }

  const getCurrentPage: ApiResponse<TCurrentPage> = await fetchApi(
    `/user-class/current-step`,
    {
      method: "GET",
      headers: {
        authorization: `Bearer ${createToken.data?.accessToken}`,
      },
    }
  );

  console.log('')

  if (
    getCurrentPage &&
    getCurrentPage.statusCode === 404 &&
    getCurrentPage.message === "ERR_CLASS_NOT_FOUND"
  ) {
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

  if (getCurrentPage && !getCurrentPage.success) {
    return <ISonnerServerError />;
  }

  console.log("getCurrentPage", getCurrentPage);

  const getDataCurrentPage = getCurrentPage.data;

  // if(!getDataCurrentPage?.checkCurrentPage){
  //   const saveStep:ApiResponse = await fetchApi(`/classroom/save-step`, {
  //     method: 'POST',
  //     headers: {
  //       authorization: `Bearer ${createToken.data?.accessToken}`,
  //     },
  //     body: {
  //       moduleId: getCurrentPage.data?.module.id,
  //       status: "OPEN"
  //   }
  //   })
  //   if(saveStep && !saveStep.success) notFound()
  // }

  const url = `${process.env.NEXT_PUBLIC_URL}/${convertSnakeToKebab(
    getDataCurrentPage?.typeClass as string
  )}/${getDataCurrentPage?.classSlug}/${getDataCurrentPage?.sectionSlug}/${
    getDataCurrentPage?.module.slug
  }`;

  await fetchApi(`/user-class/save-timezone`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${createToken.data?.accessToken}`,
    },
    body: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  });

  await fetchApi(
    `/user-class/sync-module-progress`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${createToken.data?.accessToken}`,
      },
    }
  );

  return (
    <div>
      <Portal redirectUrl={url} token={createToken.data?.accessToken} />
    </div>
  );
}
