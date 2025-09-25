import { IInput } from "@/components/base/IInput";
import ISwitch from "@/components/base/ISwitch";
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
import sectionSchema, {
  SectionFormValues,
} from "@/entities/schema/section.schema";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  classData: {
    id: number;
    title: string;
  };
  sectionId: number;
  setIsOpenDialog?: (isOpen: boolean) => void;
  getClassModule: () => void;
};

export const EditSectionDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      productId: props.classData.id,
      title: "",
      position: 0,
      includeModule: false,
    },
  });

  const onFinish = async (value: any) => {
    const update: ApiResponse = await fetchApi(
      `/admin/section/${props.sectionId}`,
      {
        method: "PATCH",
        body: value,
      }
    );

    if (update) {
      if (update.statusCode === 200) {
        toast.info("Success memperbaharui section");
        setIsOpen(false);
        props.getClassModule();
      } else {
        toast.error(update.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
    console.log(true);
    console.log("finish", value);
  };

  const handleEditSection = async () => {
    const editSection: ApiResponse<TDetailSection> = await fetchApi(
      `/admin/section/${props.sectionId}`
    );

    if (editSection) {
      if (editSection.statusCode === 200) {
        const editSectionData = editSection.data;
        form.setValue("title", editSectionData?.title || "");
        form.setValue("position", editSectionData?.position || 1);
      } else {
        toast.error(editSection.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
  };

  useEffect(() => {
    handleEditSection();
    setIsOpen(props.isOpen);
    form.setValue("productId", props.classData.id);
  }, [props.isOpen]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
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
          <DialogTitle>Edit Section</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)}>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label>Section</Label>
                <IInput
                  control={form.control}
                  name="productId"
                  type="hidden"
                  defaultValue={props.classData.id.toString()}
                ></IInput>
                <Input value={props.classData.title} disabled={true} />
              </div>
              <div className="grid gap-3">
                <Label>Judul Section</Label>
                <IInput control={form.control} name="title"></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Position</Label>
                <IInput
                  disabled={true}
                  type="number"
                  control={form.control}
                  name="position"
                ></IInput>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setIsOpen(false);
                }}
                variant={"secondary"}
              >
                Cancel
              </Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
