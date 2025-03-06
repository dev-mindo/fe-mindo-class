import { Metadata } from "next";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { notFound } from "next/navigation";
import { ModuleVideo } from "./_component/video/ModuleVideo";
import { ModuleMaterial } from "./_component/ModuleMaterial";

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

  if (getModule && getModule.success && getModule.data) {    
    switch (getModule.data.type) {
      case 'VIDEO':
        return <ModuleVideo materialData={getModule.data} />;            
      case 'INFO':
        return <ModuleMaterial materialData={getModule.data}/>
      case 'MATERIAL':
        return <ModuleMaterial materialData={getModule.data}/>
      case 'QUIZ':
        
        break
      case 'DISCUSSION':

        break
      case 'EVALUATION':

          break;
      case 'CERTIFICATE':

        break;  
    }
  }
  // TODO return berdasarkan type
  notFound()  
}
