"use client";
import { IInput } from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import { Form } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import moduleSchema, {
  ModuleFormValues,
  ModuleType,
} from "@/entities/schema/module.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ModuleDataOption } from "./AddModuleDialog";
import { useEffect, useState } from "react";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import ISwitch from "@/components/base/ISwitch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  moduleId: number;
  showEditModule: boolean;
  setShowEditModule: (isShowing: boolean) => void;
  getClassModule: () => void
};

export const EditModule = (props: Props) => {
  const [showEditModule, setShowEditModule] = useState<boolean>(
    props.showEditModule
  );
  const [sectionTitle, setSectionTitle] = useState<string>("");
  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      sectionId: 0,
      title: "",
      type: ModuleType.INFO, // atau default dari enum
      menuTitle: "",
      step: 0,
      hide: false,
      isLocked: false,
    },
  });

  const handleUpdateModule = async (value: any) => {
    const updateDataModule: ApiResponse = await fetchApi(
      `/admin/module/${props.moduleId}`,
      {
        method: "PUT",
        body: value,
      }
    );

    if (updateDataModule) {
      if (updateDataModule.statusCode === 200) {
        toast.info(`Data modul sudah diperbaharui`);
        props.getClassModule()
        setShowEditModule(false)
      } else {
        toast.error(updateDataModule.message);
      }
    } else {
      toast.error("Data gagal diperbaharui, kesalahan tidak diketahui");
    }
  };

  const handleEditModule = async () => {
    const fetchDataModule: ApiResponse<TDetailModule> = await fetchApi(
      `/admin/module/show-detail-by-module-id/${props.moduleId}`
    );
    if (fetchDataModule) {
      if (fetchDataModule.statusCode === 200) {
        const dataModule = fetchDataModule.data;
        if (dataModule) {
          setSectionTitle(dataModule.section.title);
          form.setValue("hide", dataModule.hide);
          form.setValue("isLocked", dataModule.isLocked);
          form.setValue("menuTitle", dataModule.menuTitle);
          form.setValue("sectionId", dataModule.section.id);
          form.setValue("step", dataModule.step);
          form.setValue("title", dataModule.title);
          form.setValue("type", dataModule.type as ModuleType);
        }
      }else{
        toast.error(fetchDataModule.message || 'Gagal menampilkan data')
      }
    }
  };

  useEffect(() => {
    handleEditModule();
  }, [props.moduleId]);

  useEffect(() => {
    props.setShowEditModule(showEditModule);
  }, [showEditModule]);

  return (
    <>
      <div className="">
        <h1>Edit Detail Modul</h1>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateModule)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label>Section</Label>
                  <IInput
                    control={form.control}
                    name="sectionId"
                    type="hidden"
                  ></IInput>
                  <Input defaultValue={sectionTitle || ""} disabled={true} />
                </div>
                <div className="grid gap-2">
                  <Label>Judul</Label>
                  <IInput control={form.control} name="title"></IInput>
                </div>
                <div className="grid gap-2">
                  <Label>Tipe Modul</Label>
                  <ISelect
                    control={form.control}
                    name="type"
                    options={ModuleDataOption}
                  ></ISelect>
                </div>
                <div className="grid gap-2">
                  <Label>Judul Menu</Label>
                  <IInput control={form.control} name="menuTitle"></IInput>
                </div>
                <div className="grid gap-2">
                  <Label>Step</Label>
                  <IInput
                    disabled={true}
                    type="number"
                    control={form.control}
                    name="step"
                  ></IInput>
                </div>
                <div className="grid gap-2">
                  <Label>Sembunyikan</Label>
                  <ISwitch control={form.control} name="hide"></ISwitch>
                </div>
                <div className="grid gap-2">
                  <Label>Terkunci</Label>
                  <ISwitch control={form.control} name="isLocked"></ISwitch>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setShowEditModule(false);
                  }}
                  variant={"secondary"}
                >
                  Cancel
                </Button>
                <Button type="submit">Simpan</Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};
