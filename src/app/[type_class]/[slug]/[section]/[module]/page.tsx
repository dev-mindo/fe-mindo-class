import { Metadata } from "next";
import { ModuleMaterial } from "./_component/video/ModuleVideo";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";

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

export default async function Page({ params, searchParams }: Props) {
  const getTypeClass = params.type_class;
  let getSection = params.section;
  const getSlug = params.slug;
  if (getTypeClass === "video-learning") getSection = getSlug;
  const getModuleSlug = params.module;
  const getModule: ApiResponse<TModuleMaterial> = await fetchApi(
    `/classroom/${getSection}/${getModuleSlug}`
  );
  if ((getModule && !getModule.success) || !getModule) notFound();

  // TODO return berdasarkan type
  return <ModuleMaterial materialData={getModule.data} />;
}
