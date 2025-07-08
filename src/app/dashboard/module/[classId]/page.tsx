"use client";
import { IAlertDialog } from "@/components/base/IAlertDialog";
import ICard from "@/components/base/ICard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Eye, Plus, SquarePen, Trash } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const Page = () => {
  const [dataClassModule, setDataClassModule] =
    useState<TClassModuleDetail | null>(null);

  const params = useParams<{
    classId: string;
  }>();

  const getClassModule = async () => {
    console.log(params.classId);
    const fetchClass: ApiResponse<TClassModuleDetail> = await fetchApi(
      `/admin/module/show-detail/${params.classId}`
    );

    console.log(fetchClass);

    if (
      fetchClass &&
      fetchClass.statusCode === 404 &&
      fetchClass.errorCode === "ERR_CLASS_MODULE_NOT_FOUND"
    ) {
      return (
        <IAlertDialog
          isOpen={true}
          message={fetchClass.message}
          title="Error Info"
          redirectUrl="/dashboard/module"
        />
      );
    }

    setDataClassModule(fetchClass.data || null);
  };

  useEffect(() => {
    getClassModule();
  }, []);

  useEffect(() => {
    console.log(dataClassModule);
  }, [dataClassModule]);

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg">Edit Module</h1>
      </div>
      <div className="flex gap-5">
        <ICard className="w-[50%] flex flex-col justify-between">
          <div>
            {dataClassModule?.sections.map((sectionItem) => (
              <>
                <div className="flex flex-col gap-1 border mb-4 p-4">
                  <div className="mb-3">{sectionItem.title}</div>
                  {sectionItem.module.map((moduleItem) => (
                    <div className="flex flex-col">
                      <div className="flex px-4 py-2 border items-center justify-between">
                        <div>{moduleItem.title}</div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost">
                            <Eye />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <SquarePen />
                          </Button>
                          <Button size="icon" variant="ghost">
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full my-1">
                    <Plus />
                    Tambah Module
                  </Button>
                  {/* <div className="flex flex-col">
                  <div className="flex px-4 py-2 border w-full">
                    
                  </div>
                </div> */}
                </div>
              </>
            ))}
            <Button className="w-full my-1">
              <Plus />
              Tambah Section
            </Button>
          </div>
          <div className="flex justify-between mt-5">
            <Button asChild>
              <Link href="/dashboard/module">Kembali</Link>
            </Button>
            <Button>Simpan</Button>
          </div>
        </ICard>
        <ICard className="w-full"></ICard>
      </div>
    </div>
  );
};

export default Page;
