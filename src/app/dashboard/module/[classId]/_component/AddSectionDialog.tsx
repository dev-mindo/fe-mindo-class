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
  position: number;
  setIsOpenDialog?: (isOpen: boolean) => void;
  getClassModule: () => void;
};

export const AddSectionDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      productId: props.classData.id,
      title: "",
      position: props.position,
      includeModule: false,
    },
  });

  const onFinish = async (value: any) => {
    const store: ApiResponse = await fetchApi("/admin/section", {
      method: "POST",
      body: value,
    });

    if (store) {
      if (store.statusCode === 200) {
        toast.info("Success menambahkan modul");
        setIsOpen(false);
        props.getClassModule();
      } else {
        toast.error(store.message);
      }
    } else {
      toast.error("Error tidak ditemukan");
    }
    console.log(true);
    console.log("finish", value);
  };

  useEffect(() => {
    setIsOpen(props.isOpen);
    form.setValue("productId", props.classData.id);
    form.setValue("position", props.position)
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
          <DialogTitle>Tambah Section</DialogTitle>
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
                  defaultValue={props.position.toString()}
                  value={props.position.toString()}
                  type="number"
                  control={form.control}
                  name="position"
                ></IInput>
              </div>
              <div className="grid gap-3">
                <Label>Membuat module?</Label>
                <ISwitch control={form.control} name="includeModule"></ISwitch>
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
