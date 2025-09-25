"use client";
import { IAlertDialog } from "@/components/base/IAlertDialog";
import ICard from "@/components/base/ICard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Eye, Plus, SquarePen, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddModuleDialog } from "./_component/AddModuleDialog";
import { DestroyModuleDialog } from "./_component/DestroyModuleDialog";
import { EditModule } from "./_component/EditModule";
import { AddSectionDialog } from "./_component/AddSectionDialog";
import { EditSectionDialog } from "./_component/EditSectionDialog";
import { DestroySectionDialog } from "./_component/DestroySectionDialog";

const Page = () => {
  const [dataClassModule, setDataClassModule] =
    useState<TClassModuleDetail | null>(null);

  const [isOpenDialogModule, setOpenDialogModule] = useState<boolean>(false);

  const [dataModule, setDataModule] = useState(null);

  const [addStepNumber, setAddStepNumber] = useState<number>(0);

  const [openDeleteModuleDialog, setOpenDeleteModuleDialog] =
    useState<boolean>(false);

  const [moduleId, setModuleId] = useState<number>(0);

  const [showEditModule, setShowEditModule] = useState<boolean>(false);

  const [dataDeleteModuleDialog, setDataDeleteModuleDialog] = useState<{
    id: number;
    title: string;
  }>({
    id: 0,
    title: "",
  });

  const [openAddSectionDialog, setOpenAddSectionDialog] =
    useState<boolean>(false);

  const [sectionPosition, setSectionPosition] = useState<number>(0);

  const [openSectionEditDialog, setOpenSectionEditDialog] =
    useState<boolean>(false);

  const [openSectionDestroyDialog, setOpenSectionDestroyDialog] =
    useState<boolean>(false);

  const [classData, setClassData] = useState<{
    id: number;
    title: string;
  }>({
    id: 0,
    title: "",
  });

  const [dataSection, setDataSection] = useState<{
    id: number;
    title: string;
  }>({
    id: 0,
    title: "",
  });

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

  const handleAddModule = () => {
    setOpenDialogModule(true);
  };

  useEffect(() => {
    getClassModule();
  }, []);

  useEffect(() => {
    console.log(dataClassModule);
    setClassData({
      id: dataClassModule?.id || 0,
      title: dataClassModule?.title || "",
    });
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
                  <div className="flex justify-between">
                    <div className="mb-3">{sectionItem.title}</div>
                    <div className="flex">
                      <Button
                        onClick={() => {
                          setDataSection({
                            id: sectionItem.id,
                            title: sectionItem.title,
                          });
                          setOpenSectionEditDialog(true);
                        }}
                        size="icon"
                        variant="ghost"
                      >
                        <SquarePen />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setDataSection({
                            id: sectionItem.id,
                            title: sectionItem.title,
                          });
                          setOpenSectionDestroyDialog(true);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </div>
                  {sectionItem.module.map((moduleItem) => (
                    <div className="flex flex-col">
                      <div className="flex px-4 py-2 border items-center justify-between">
                        <div>{moduleItem.title}</div>
                        <div className="flex gap-1">
                          <div>
                            <Badge>{moduleItem.type}</Badge>
                          </div>
                          {/* <Button size="icon" variant="ghost">
                            <Eye />
                          </Button> */}
                          <Button
                            onClick={() => {
                              setModuleId(moduleItem.id);
                              setShowEditModule(true);
                            }}
                            size="icon"
                            variant="ghost"
                          >
                            <SquarePen />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => {
                              setDataDeleteModuleDialog({
                                id: moduleItem.id,
                                title: moduleItem.title,
                              });
                              setOpenDeleteModuleDialog(true);
                            }}
                          >
                            <Trash />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      handleAddModule();
                      setDataSection({
                        id: sectionItem.id,
                        title: sectionItem.title,
                      });
                      const getLastNumber = sectionItem.module.at(
                        sectionItem.module.length - 1
                      );
                      console.log("last number", getLastNumber?.step);
                      setAddStepNumber(
                        getLastNumber && getLastNumber.step
                          ? getLastNumber.step + 1
                          : 1
                      );
                    }}
                    className="w-full my-1"
                  >
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
            <Button
              onClick={() => {
                const getLastPosition = dataClassModule?.sections.at(
                  dataClassModule?.sections.length - 1
                );
                setSectionPosition(
                  getLastPosition ? getLastPosition.position + 1 : 1
                );
                setOpenAddSectionDialog(true);
              }}
              className="w-full my-1"
            >
              <Plus />
              Tambah Section
            </Button>
          </div>
          <div className="flex justify-between mt-5">
            {/* <Button asChild>
              <Link href="/dashboard/module">Kembali</Link>
            </Button>
            <Button>Simpan</Button> */}
          </div>
        </ICard>
        <ICard className="w-full">
          {showEditModule && moduleId > 0 ? (
            <EditModule
              moduleId={moduleId}
              setShowEditModule={setShowEditModule}
              showEditModule={showEditModule}
              getClassModule={getClassModule}
            />
          ) : (
            <div>Tidak Ada Data</div>
          )}
        </ICard>
      </div>
      <AddModuleDialog
        isOpen={isOpenDialogModule}
        section={dataSection}
        step={addStepNumber}
        setIsOpenDialog={setOpenDialogModule}
        getClassModule={getClassModule}
      />
      <DestroyModuleDialog
        getClassModule={getClassModule}
        isOpen={openDeleteModuleDialog}
        module={dataDeleteModuleDialog}
        setIsOpenDialog={setOpenDeleteModuleDialog}
      />
      <AddSectionDialog
        classData={classData}
        getClassModule={getClassModule}
        isOpen={openAddSectionDialog}
        position={sectionPosition}
        setIsOpenDialog={setOpenAddSectionDialog}
      />
      <EditSectionDialog
        classData={classData}
        getClassModule={getClassModule}
        isOpen={openSectionEditDialog}
        sectionId={dataSection.id}
        setIsOpenDialog={setOpenSectionEditDialog}
      />

      <DestroySectionDialog
        getClassModule={getClassModule}
        isOpen={openSectionDestroyDialog}
        section={dataSection}
        setIsOpenDialog={setOpenSectionDestroyDialog}
      />
    </div>
  );
};

export default Page;
