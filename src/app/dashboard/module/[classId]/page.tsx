"use client";
import { IAlertDialog } from "@/components/base/IAlertDialog";
import { Button } from "@/components/ui/button";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { DragEvent } from "react";
import { AddModuleDialog } from "./_component/AddModuleDialog";
import { DestroyModuleDialog } from "./_component/DestroyModuleDialog";
import { AddSectionDialog } from "./_component/AddSectionDialog";
import { EditSectionDialog } from "./_component/EditSectionDialog";
import { DestroySectionDialog } from "./_component/DestroySectionDialog";
import { DashboardPageTitle } from "../../_component/page-title";
import { toast } from "sonner";
import { ClassModuleSummary } from "./_component/ClassModuleSummary";
import { EditModuleAside } from "./_component/EditModuleAside";
import { ModuleStructure } from "./_component/ModuleStructure";
import type {
  DragItem,
  ModuleDropTarget,
  SectionItem,
} from "./_component/moduleTypes";

const Page = () => {
  const [dataClassModule, setDataClassModule] =
    useState<TClassModuleDetail | null>(null);

  const [isOpenDialogModule, setOpenDialogModule] = useState<boolean>(false);

  const [addStepNumber, setAddStepNumber] = useState<number>(0);

  const [openDeleteModuleDialog, setOpenDeleteModuleDialog] =
    useState<boolean>(false);

  const [moduleId, setModuleId] = useState<number>(0);

  const [showEditModule, setShowEditModule] = useState<boolean>(false);
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [moduleDropTarget, setModuleDropTarget] =
    useState<ModuleDropTarget | null>(null);

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

  const totalModule =
    dataClassModule?.sections.reduce(
      (total, section) => total + section.module.length,
      0
    ) ?? 0;

  const getClassModule = async () => {
    const fetchClass: ApiResponse<TClassModuleDetail> = await fetchApi(
      `/admin/module/show-detail/${params.classId}`
    );

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

  const handleAddSection = () => {
    const getLastPosition = dataClassModule?.sections.at(
      dataClassModule?.sections.length - 1
    );

    setSectionPosition(getLastPosition ? getLastPosition.position + 1 : 1);
    setOpenAddSectionDialog(true);
  };

  const persistModulesOrder = async (sections: SectionItem[]) => {
    const modules = sections.flatMap((section) =>
      section.module.map((module, index) => ({
        ...module,
        sectionId: section.id,
        step: index + 1,
      }))
    );

    const responses = await Promise.all(
      modules.map((module) =>
        fetchApi<ApiResponse>(`/admin/module/${module.id}`, {
          method: "PUT",
          body: {
            sectionId: module.sectionId,
            title: module.title,
            type: module.type,
            menuTitle: module.menuTitle,
            step: module.step,
            hide: module.hide,
            isLocked: module.isLocked,
          },
        })
      )
    );

    if (responses.some((response) => response.statusCode !== 200)) {
      throw new Error("Failed to update module order");
    }
  };

  const handleModuleDrop = async (
    targetSectionId: number,
    targetModuleId?: number,
    position: ModuleDropTarget["position"] = "before"
  ) => {
    if (!dataClassModule || dragItem?.type !== "module") {
      return;
    }

    if (
      dragItem.sectionId === targetSectionId &&
      dragItem.moduleId === targetModuleId
    ) {
      setDragItem(null);
      setModuleDropTarget(null);
      return;
    }

    const sections = dataClassModule.sections.map((section) => ({
      ...section,
      module: [...section.module],
    }));
    const sourceSection = sections.find(
      (section) => section.id === dragItem.sectionId
    );
    const targetSection = sections.find((section) => section.id === targetSectionId);

    if (!sourceSection || !targetSection) {
      setDragItem(null);
      setModuleDropTarget(null);
      return;
    }

    const sourceIndex = sourceSection.module.findIndex(
      (module) => module.id === dragItem.moduleId
    );

    if (sourceIndex < 0) {
      setDragItem(null);
      setModuleDropTarget(null);
      return;
    }

    const [movedModule] = sourceSection.module.splice(sourceIndex, 1);
    const foundTargetIndex = targetModuleId
      ? targetSection.module.findIndex((module) => module.id === targetModuleId)
      : targetSection.module.length;
    const targetIndex =
      position === "after" && foundTargetIndex >= 0
        ? foundTargetIndex + 1
        : foundTargetIndex;

    targetSection.module.splice(
      targetIndex >= 0 ? targetIndex : targetSection.module.length,
      0,
      {
        ...movedModule,
        sectionId: targetSection.id,
      }
    );

    const reorderedSections = sections.map((section) => ({
      ...section,
      module: section.module.map((module, index) => ({
        ...module,
        sectionId: section.id,
        step: index + 1,
      })),
    }));

    setDataClassModule({
      ...dataClassModule,
      sections: reorderedSections,
    });
    setDragItem(null);
    setModuleDropTarget(null);

    try {
      await persistModulesOrder(reorderedSections);
      toast.info("Urutan modul sudah diperbaharui");
      getClassModule();
    } catch (error) {
      toast.error("Gagal memperbaharui urutan modul");
      getClassModule();
    }
  };

  const handleModuleDragOver = (
    event: DragEvent<HTMLElement>,
    sectionId: number,
    moduleId: number
  ) => {
    if (dragItem?.type !== "module" || dragItem.moduleId === moduleId) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < rect.top + rect.height / 2 ? "before" : "after";
    setModuleDropTarget({ sectionId, moduleId, position });
  };

  const handleModuleListDragOver = (
    event: DragEvent<HTMLElement>,
    sectionId: number
  ) => {
    if (dragItem?.type !== "module") {
      return;
    }

    event.preventDefault();

    if (event.target === event.currentTarget) {
      setModuleDropTarget({ sectionId, position: "end" });
    }
  };

  useEffect(() => {
    getClassModule();
  }, []);

  useEffect(() => {
    setClassData({
      id: dataClassModule?.id || 0,
      title: dataClassModule?.title || "",
    });
  }, [dataClassModule]);

  return (
    <div className="w-full space-y-5">
      <DashboardPageTitle title="Edit Module" />
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Atur section dan modul untuk kelas ini.
          </p>
        </div>
        <Button
          onClick={handleAddSection}
        >
          <Plus />
          Tambah Section
        </Button>
      </div>

      <ClassModuleSummary dataClassModule={dataClassModule} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <ModuleStructure
          dataClassModule={dataClassModule}
          totalModule={totalModule}
          dragItem={dragItem}
          moduleDropTarget={moduleDropTarget}
          setDragItem={setDragItem}
          setModuleDropTarget={setModuleDropTarget}
          setDataSection={setDataSection}
          setModuleId={setModuleId}
          setShowEditModule={setShowEditModule}
          setDataDeleteModuleDialog={setDataDeleteModuleDialog}
          setOpenDeleteModuleDialog={setOpenDeleteModuleDialog}
          setOpenSectionEditDialog={setOpenSectionEditDialog}
          setOpenSectionDestroyDialog={setOpenSectionDestroyDialog}
          setAddStepNumber={setAddStepNumber}
          handleAddModule={handleAddModule}
          handleAddSection={handleAddSection}
          handleModuleDrop={handleModuleDrop}
          handleModuleDragOver={handleModuleDragOver}
          handleModuleListDragOver={handleModuleListDragOver}
        />

        <EditModuleAside
          moduleId={moduleId}
          showEditModule={showEditModule}
          setShowEditModule={setShowEditModule}
          getClassModule={getClassModule}
        />
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
        sections={dataClassModule?.sections ?? []}
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
