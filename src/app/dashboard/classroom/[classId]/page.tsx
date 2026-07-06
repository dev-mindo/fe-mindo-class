"use client";
import { IAlertDialog } from "@/components/base/IAlertDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardContext } from "@/context/DashboardContext";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { DragEvent } from "react";
import { DashboardPageTitle } from "../../_component/page-title";
import { toast } from "sonner";
import { DragItem, ModuleDropTarget, SectionItem } from "../../module/[classId]/_component/moduleTypes";
import { ModuleStructure } from "../../module/[classId]/_component/ModuleStructure";
import { EditModuleAside } from "../../module/[classId]/_component/EditModuleAside";
import { AddModuleDialog } from "../../module/[classId]/_component/AddModuleDialog";
import { DestroyModuleDialog } from "../../module/[classId]/_component/DestroyModuleDialog";
import { AddSectionDialog } from "../../module/[classId]/_component/AddSectionDialog";
import { EditSectionDialog } from "../../module/[classId]/_component/EditSectionDialog";
import { DestroySectionDialog } from "../../module/[classId]/_component/DestroySectionDialog";
import {
  ClassProductForm,
  ClassProductFormValues,
} from "./_component/ClassProductForm";
import { ParticipantComponent } from "../../list-participant/_component/Participant";
import { ScoresParticipantComponent } from "../../list-participant/_component/ScoresParticipant";
import { ProgressParticipantComponent } from "../../list-participant/_component/ProgressModule";
import { ProgressViewSelect } from "../../list-participant/_component/progress-module/ProgressViewSelect";
import type { ViewMode } from "../../list-participant/_component/progress-module/types";
import { canManageClassroom } from "@/lib/dashboard-permissions";
import { toOffsetDateTime } from "@/lib/utils";

type ClassSectionWithModules = TClassModuleDetail["sections"][number] & {
  modules?: TClassModuleDetail["sections"][number]["module"];
};

type ClassAssignmentUser = {
  id: number;
  name: string;
  username: string;
  role: string;
};

type ClassAssignmentRelation = {
  user?: ClassAssignmentUser | null;
};

type ClassDetailWithAssignments = TClassModuleDetail & {
  instructorClass?: ClassAssignmentRelation | ClassAssignmentRelation[] | null;
  adminClasses?: ClassAssignmentRelation[];
};

type AccountListData = {
  results?: ClassAssignmentUser[];
  data?: ClassAssignmentUser[];
};

type InstructorListData = {
  data?: ClassAssignmentUser[];
};

const normalizeClassDetail = (
  data?: TClassModuleDetail | null
): TClassModuleDetail | null => {
  if (!data) {
    return null;
  }

  return {
    ...data,
    sections: (data.sections ?? []).map((section) => {
      const sectionData = section as ClassSectionWithModules;

      return {
        ...section,
        module: Array.isArray(sectionData.module)
          ? sectionData.module
          : sectionData.modules ?? [],
      };
    }),
  };
};

const getRelationUsers = (
  relation?: ClassAssignmentRelation | ClassAssignmentRelation[] | null
) => {
  if (!relation) return [];

  const relations = Array.isArray(relation) ? relation : [relation];

  return relations
    .map((item) => item.user)
    .filter((user): user is ClassAssignmentUser => Boolean(user));
};

const normalizeAccountOptions = (data?: AccountListData | null) =>
  (data?.results ?? data?.data ?? []).map((user) => ({
    ...user,
    id: Number(user.id),
  }));

const toAccountOption = (user: ClassAssignmentUser) => ({
  ...user,
  id: String(user.id),
});

const mergeAccountOptions = (
  options: ClassAssignmentUser[],
  selected: ClassAssignmentUser[]
) => {
  const accountMap = new Map<string, ReturnType<typeof toAccountOption>>();

  [...selected, ...options].forEach((user) => {
    accountMap.set(String(user.id), toAccountOption(user));
  });

  return Array.from(accountMap.values());
};

const Page = () => {
  const [dataClassModule, setDataClassModule] =
    useState<TClassModuleDetail | null>(null);

  const [isOpenDialogModule, setOpenDialogModule] = useState<boolean>(false);

  const [addStepNumber, setAddStepNumber] = useState<number>(0);

  const [openDeleteModuleDialog, setOpenDeleteModuleDialog] =
    useState<boolean>(false);

  const [moduleId, setModuleId] = useState<number>(0);

  const [isUpdatingClass, setIsUpdatingClass] = useState<boolean>(false);
  const [instructorAccountOptions, setInstructorAccountOptions] = useState<
    ClassAssignmentUser[]
  >([]);
  const [adminAccountOptions, setAdminAccountOptions] = useState<
    ClassAssignmentUser[]
  >([]);
  const [picAccountOptions, setPicAccountOptions] = useState<
    ClassAssignmentUser[]
  >([]);
  const [scoreSectionId, setScoreSectionId] = useState<number | null>(null);
  const [progressSectionId, setProgressSectionId] = useState<number | null>(
    null
  );
  const [progressViewMode, setProgressViewMode] =
    useState<ViewMode>("module");

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
  const { setHideSidebar, user } = useDashboardContext();
  const canManage = canManageClassroom(user?.role);
  const totalModule =
    dataClassModule?.sections.reduce(
      (total, section) => total + (section.module?.length ?? 0),
      0
    ) ?? 0;

  const classAssignments = dataClassModule as ClassDetailWithAssignments | null;
  const instructorUsers = getRelationUsers(classAssignments?.instructorClass);
  const assignmentUsers = getRelationUsers(classAssignments?.adminClasses);
  const adminUsers = assignmentUsers.filter((user) => user.role === "ADMIN");
  const picUsers = assignmentUsers.filter((user) => user.role === "PIC");
  const instructorOptions = useMemo(
    () => mergeAccountOptions(instructorAccountOptions, instructorUsers),
    [instructorAccountOptions, instructorUsers]
  );
  const adminOptions = useMemo(
    () => mergeAccountOptions(adminAccountOptions, adminUsers),
    [adminAccountOptions, adminUsers]
  );
  const picOptions = useMemo(
    () => mergeAccountOptions(picAccountOptions, picUsers),
    [picAccountOptions, picUsers]
  );
  const selectedAdminOptions = useMemo(
    () => adminUsers.map(toAccountOption),
    [adminUsers]
  );
  const selectedPicOptions = useMemo(
    () => picUsers.map(toAccountOption),
    [picUsers]
  );

  const getClassModule = async () => {
    const [fetchClass, fetchModule]: [
      ApiResponse<TClassModuleDetail>,
      ApiResponse<TClassModuleDetail>
    ] = await Promise.all([
      fetchApi<ApiResponse<TClassModuleDetail>>(
        `/admin/classroom/show-detail/${params.classId}`
      ),
      fetchApi<ApiResponse<TClassModuleDetail>>(
        `/admin/module/show-detail/${params.classId}`
      ),
    ]);

    if (
      fetchClass &&
      fetchClass.statusCode === 404 &&
      fetchModule &&
      fetchModule.statusCode === 404
    ) {
      return (
        <IAlertDialog
          isOpen={true}
          message={fetchClass.message}
          title="Error Info"
          redirectUrl="/dashboard/classroom"
        />
      );
    }

    const classDetail = normalizeClassDetail(fetchClass.data);
    const moduleDetail = normalizeClassDetail(fetchModule.data);
    const mergedDetail =
      classDetail || moduleDetail
        ? {
            ...(classDetail ?? {}),
            ...(moduleDetail ?? {}),
          } as TClassModuleDetail
        : null;

    if (!mergedDetail) {
      setDataClassModule(null);
      return;
    }

    setDataClassModule({
      ...mergedDetail,
      sections: moduleDetail?.sections?.length
        ? moduleDetail.sections
        : classDetail?.sections ?? [],
    });
  };

  const getAccountOptions = async () => {
    const [instructorResponse, adminResponse, picResponse]: [
      ApiResponse<InstructorListData>,
      ApiResponse<AccountListData>,
      ApiResponse<AccountListData>
    ] = await Promise.all([
      fetchApi<ApiResponse<InstructorListData>>(
        "/admin/instructor?page=1&limit=100&role=PENGAJAR"
      ),
      fetchApi<ApiResponse<AccountListData>>(
        "/admin/admin?page=1&limit=100&role=ADMIN"
      ),
      fetchApi<ApiResponse<AccountListData>>(
        "/admin/admin?page=1&limit=100&role=PIC"
      ),
    ]);

    if (instructorResponse.statusCode === 200 && instructorResponse.data) {
      setInstructorAccountOptions(
        normalizeAccountOptions(instructorResponse.data)
      );
    }

    if (adminResponse.statusCode === 200 && adminResponse.data) {
      setAdminAccountOptions(normalizeAccountOptions(adminResponse.data));
    }

    if (picResponse.statusCode === 200 && picResponse.data) {
      setPicAccountOptions(normalizeAccountOptions(picResponse.data));
    }
  };

  const handleUpdateClass = async (values: ClassProductFormValues) => {
    if (!canManage) {
      toast.error("Anda tidak memiliki akses untuk mengubah kelas");
      return false;
    }

    if (!values.title.trim()) {
      toast.error("Title kelas wajib diisi");
      return false;
    }

    const productId =
      (
        dataClassModule as (TClassModuleDetail & { productId?: number }) | null
      )?.productId ?? dataClassModule?.sections.at(0)?.productId;

    if (!productId) {
      toast.error("Product ID kelas tidak ditemukan");
      return false;
    }

    setIsUpdatingClass(true);

    try {
      const adminIds = Array.from(
        new Set([...values.adminIds, ...values.picIds].map(Number))
      ).filter((id) => Number.isInteger(id) && id > 0);
      const body: {
        productType: string;
        publish: boolean;
        publishTime?: string;
        title: string;
        isAutoGetCertificate: boolean;
        instructorId?: number;
        adminIds: number[];
      } = {
        adminIds,
        productType: values.productType,
        publish: values.publish,
        publishTime: values.publishTime
          ? toOffsetDateTime(values.publishTime) ?? undefined
          : dataClassModule?.publishTime,
        title: values.title,
        isAutoGetCertificate: values.isAutoGetCertificate,
      };

      if (values.instructorId) {
        body.instructorId = Number(values.instructorId);
      }

      const updateClass: ApiResponse<TClassModuleDetail> = await fetchApi(
        `/admin/classroom/${productId}`,
        {
          method: "PUT",
          body,
        }
      );

      if (updateClass.statusCode !== 200 && updateClass.statusCode !== 201) {
        toast.error(updateClass.message || "Gagal memperbaharui kelas");
        return false;
      }

      toast.info("Data kelas sudah diperbaharui");
      getClassModule();
      return true;
    } catch (error) {
      toast.error("Gagal memperbaharui kelas");
      return false;
    } finally {
      setIsUpdatingClass(false);
    }
  };

  const handleAddModule = () => {
    if (!canManage) return;
    setOpenDialogModule(true);
  };

  const handleAddSection = () => {
    if (!canManage) return;

    const getLastPosition = dataClassModule?.sections.at(
      dataClassModule?.sections.length - 1
    );

    setSectionPosition(getLastPosition ? getLastPosition.position + 1 : 1);
    setOpenAddSectionDialog(true);
  };

  const persistModuleOrder = async (
    moduleId: number,
    sectionId: number,
    step: number
  ) => {
    if (!canManage) return;

    const response: ApiResponse = await fetchApi(
      `/admin/module/${moduleId}/order`,
      {
        method: "PATCH",
        body: { sectionId, step },
      }
    );

    if (!response.success) {
      throw new Error(response.message || "Failed to update module order");
    }
  };

  const handleModuleDrop = async (
    targetSectionId: number,
    targetModuleId?: number,
    position: ModuleDropTarget["position"] = "before"
  ) => {
    if (!canManage || !dataClassModule || dragItem?.type !== "module") {
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
      module: [...(section.module ?? [])],
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
      module: (section.module ?? []).map((module, index) => ({
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
      const movedModuleOrder = reorderedSections
        .find((section) => section.id === targetSectionId)
        ?.module.find((module) => module.id === movedModule.id);

      if (!movedModuleOrder) {
        throw new Error("Module order not found");
      }

      await persistModuleOrder(
        movedModule.id,
        targetSectionId,
        movedModuleOrder.step
      );
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
    getAccountOptions();
  }, []);

  useEffect(() => {
    setHideSidebar(true);

    return () => {
      setHideSidebar(false);
    };
  }, [setHideSidebar]);

  useEffect(() => {
    setClassData({
      id: dataClassModule?.id || 0,
      title: dataClassModule?.title || "",
    });

    if (!dataClassModule?.sections.length) {
      setScoreSectionId(null);
      setProgressSectionId(null);
      return;
    }

    const hasSelectedSection = dataClassModule.sections.some(
      (section) => section.id === scoreSectionId
    );
    const hasSelectedProgressSection = dataClassModule.sections.some(
      (section) => section.id === progressSectionId
    );

    if (!hasSelectedSection) {
      setScoreSectionId(dataClassModule.sections[0].id);
    }

    if (!hasSelectedProgressSection) {
      setProgressSectionId(dataClassModule.sections[0].id);
    }
  }, [dataClassModule]);

  return (
    <div className="w-full space-y-5">
      <DashboardPageTitle title="Kelas" />
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Atur detail kelas, section, dan modul untuk kelas ini.
          </p>
        </div>
        {/* <Button
          onClick={handleAddSection}
        >
          <Plus />
          Tambah Section
        </Button> */}
      </div>

      <ClassProductForm
        dataClass={dataClassModule}
        instructors={instructorOptions}
        adminOptions={adminOptions}
        picOptions={picOptions}
        selectedAdmins={selectedAdminOptions}
        selectedPics={selectedPicOptions}
        isUpdating={isUpdatingClass}
        readOnly={!canManage}
        onSubmit={handleUpdateClass}
      />

      <Tabs defaultValue="participants" className="space-y-4">
        <TabsList className="grid h-auto w-full grid-cols-2 md:w-fit md:grid-cols-5">
          <TabsTrigger value="participants">Peserta</TabsTrigger>
          <TabsTrigger value="scores">Nilai Peserta</TabsTrigger>
          <TabsTrigger value="progress">Progress Peserta</TabsTrigger>
          <TabsTrigger value="assignments">Admin & PIC</TabsTrigger>
          <TabsTrigger value="structure">Struktur Modul</TabsTrigger>
        </TabsList>

        <TabsContent
          value="participants"
          className="rounded-lg border bg-card p-4"
        >
          <ParticipantComponent selectedClass={params.classId} />
        </TabsContent>

        <TabsContent value="scores" className="rounded-lg border bg-card p-4">
          <div className="mb-4 flex flex-col gap-2 md:max-w-xs">
            <p className="text-sm font-medium">Section</p>
            <Select
              value={scoreSectionId ? String(scoreSectionId) : ""}
              onValueChange={(value) => setScoreSectionId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih section" />
              </SelectTrigger>
              <SelectContent>
                {dataClassModule?.sections.map((section) => (
                  <SelectItem key={section.id} value={String(section.id)}>
                    {section.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScoresParticipantComponent
            selectedClass={params.classId}
            sectionId={scoreSectionId}
          />
        </TabsContent>

        <TabsContent value="progress" className="rounded-lg border bg-card p-4">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">Section</p>
              <Select
                value={progressSectionId ? String(progressSectionId) : ""}
                onValueChange={(value) => setProgressSectionId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih section" />
                </SelectTrigger>
                <SelectContent>
                  {dataClassModule?.sections.map((section) => (
                    <SelectItem key={section.id} value={String(section.id)}>
                      {section.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ProgressViewSelect
              viewMode={progressViewMode}
              setViewMode={setProgressViewMode}
            />
          </div>
          <ProgressParticipantComponent
            selectedClass={params.classId}
            selectedSetion={progressSectionId}
            viewMode={progressViewMode}
            onViewModeChange={setProgressViewMode}
          />
        </TabsContent>

        <TabsContent
          value="assignments"
          className="rounded-lg border bg-card p-4"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <ClassAccountTable
              title="Admin"
              users={adminUsers}
              emptyMessage="Belum ada admin untuk kelas ini."
            />
            <ClassAccountTable
              title="PIC"
              users={picUsers}
              emptyMessage="Belum ada PIC untuk kelas ini."
            />
          </div>
        </TabsContent>

        <TabsContent value="structure">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
            <ModuleStructure
              dataClassModule={dataClassModule}
              totalModule={totalModule}
              dragItem={dragItem}
              moduleDropTarget={moduleDropTarget}
              readOnly={!canManage}
              allowReadOnlyDetail={!canManage}
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
              classId={params.classId}
              moduleId={moduleId}
              showEditModule={showEditModule}
              setShowEditModule={setShowEditModule}
              getClassModule={getClassModule}
            />
          </div>
        </TabsContent>
      </Tabs>
      {canManage ? (
        <>
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
        </>
      ) : null}
    </div>
  );
};

export default Page;

function ClassAccountTable({
  title,
  users,
  emptyMessage,
}: {
  title: string;
  users: ClassAssignmentUser[];
  emptyMessage: string;
}) {
  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            Total {users.length} akun
          </p>
        </div>
        <Badge variant="secondary">{users.length}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {user.username}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{user.role}</Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="h-24 text-center text-muted-foreground"
                colSpan={3}
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
