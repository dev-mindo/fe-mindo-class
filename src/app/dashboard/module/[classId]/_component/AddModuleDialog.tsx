"use client";
import { IInput } from "@/components/base/IInput";
import ISelect from "@/components/base/ISelect";
import ISwitch from "@/components/base/ISwitch";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import moduleSchema, {
  ModuleFormValues,
  ModuleType,
} from "@/entities/schema/module.schema";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export const ModuleDataOption = [
  {
    label: "INFO",
    value: "INFO",
  },
  {
    label: "QUIZ",
    value: "QUIZ",
  },
  {
    label: "VIDEO",
    value: "VIDEO",
  },
  {
    label: "DISCUSSION",
    value: "DISCUSSION",
  },
  {
    label: "EVALUATION",
    value: "EVALUATION",
  },
  {
    label: "CERTIFICATE",
    value: "CERTIFICATE",
  },
  {
    label: "MATERIAL",
    value: "MATERIAL",
  },
  {
    label: "TASK",
    value: "TASK",
  },
  {
    label: "LIVE",
    value: "LIVE",
  },
];

type Props = {
  isOpen: boolean;
  section: {
    id: number;
    title: string;
  };
  step: number;
  setIsOpenDialog?: (isOpen: boolean) => void;
  getClassModule: () => void
};

export const AddModuleDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);  

  const form = useForm<ModuleFormValues>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      sectionId: props.section.id,
      title: "",
      type: ModuleType.INFO, // atau default dari enum
      menuTitle: "",
      step: props.step || 0,
      hide: false,
      isLocked: false,
    },
  });
  

  const onFinish = async (value: any) => {
    // setIsOpen(false);
    const store: ApiResponse = await fetchApi('/admin/module', {
      method: 'POST',
      body: value
    })

    if(store){
      if(store.statusCode === 200){
        toast.info("Success menambahkan modul")
        setIsOpen(false)       
        props.getClassModule() 
      }else{
        toast.error(store.message)
      }
    }else{
      toast.error('Error tidak ditemukan')
    }
    console.log(true);
    console.log("finish", value);
  };  
  
  useEffect(() => {
    setIsOpen(props.isOpen);
    form.setValue("step", props.step);
    form.setValue("sectionId", props.section.id);
  }, [props.isOpen]);

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
    props.setIsOpenDialog?.(isOpen);
  }, [isOpen]);


  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Module</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)}>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label>Section</Label>
                <IInput
                  control={form.control}
                  name="sectionId"
                  type="hidden"
                  defaultValue={props.section.id.toString()}
                ></IInput>
                <Input value={props.section.title} disabled={true} />
              </div>
              <div className="grid gap-3">
                <Label>Judul</Label>
                <IInput control={form.control} name="title"></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Tipe Modul</Label>
                <ISelect
                  control={form.control}
                  name="type"
                  options={ModuleDataOption}
                ></ISelect>
              </div>
              <div className="grid gap-3">
                <Label>Judul Menu</Label>
                <IInput control={form.control} name="menuTitle"></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Step</Label>
                <IInput
                  disabled={true}
                  defaultValue={props.step.toString()}
                  value={props.step.toString()}
                  type="number"
                  control={form.control}
                  name="step"
                ></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Sembunyikan</Label>
                <ISwitch control={form.control} name="hide"></ISwitch>
              </div>
              <div className="grid gap-3">
                <Label>Terkunci</Label>
                <ISwitch control={form.control} name="isLocked"></ISwitch>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              {/* <Button
                onClick={() => {
                  setIsOpen(false);
                }}
                variant={"secondary"}
              >
                Cancel
              </Button> */}
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
