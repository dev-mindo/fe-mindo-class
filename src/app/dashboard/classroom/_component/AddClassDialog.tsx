"use client";

import { IInput } from "@/components/base/IInput";
import ISwitch from "@/components/base/ISwitch";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const classSchema = z.object({
  title: z.string().min(1, "Nama kelas wajib diisi"),
  productType: z.string().min(1, "Tipe kelas wajib dipilih"),
  thumbnail: z.string().min(1, "Thumbnail wajib diisi"),
  publish: z.boolean(),
  isAutoGetCertificate: z.boolean(),
});

type ClassFormValues = z.infer<typeof classSchema>;

type Props = {
  isOpen: boolean;
  setIsOpenDialog?: (isOpen: boolean) => void;
  getClassroom: () => void;
};

const classTypeOptions = [
  {
    label: "Video Learning",
    value: "VIDEO_LEARNING",
  },
  {
    label: "Live Class",
    value: "LIVE_CLASS",
  },
];

export const AddClassDialog = ({
  isOpen: isOpenProps,
  setIsOpenDialog,
  getClassroom,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      title: "",
      productType: "",
      thumbnail: "",
      publish: false,
      isAutoGetCertificate: false,
    },
  });

  const onFinish = async (value: ClassFormValues) => {
    const store: ApiResponse = await fetchApi("/admin/classroom", {
      method: "POST",
      body: value,
    });

    if (!store) {
      toast.error("Error tidak ditemukan");
      return;
    }

    if (store.statusCode === 200 || store.statusCode === 201) {
      toast.info("Success menambahkan kelas");
      setIsOpen(false);
      getClassroom();
      return;
    }

    toast.error(store.message);
  };

  useEffect(() => {
    setIsOpen(isOpenProps);
  }, [isOpenProps]);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }

    setIsOpenDialog?.(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Kelas</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFinish)}>
            <div className="grid gap-4">
              <div className="grid gap-3">
                <IInput
                  control={form.control}
                  label="Nama Kelas"
                  name="title"
                />
              </div>
              <div className="grid gap-3">
                <FormField
                  control={form.control}
                  name="productType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipe Kelas</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tipe kelas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classTypeOptions.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-3">
                <IInput
                  control={form.control}
                  label="Thumbnail URL"
                  name="thumbnail"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <ISwitch control={form.control} label="Publish" name="publish" />
                <ISwitch
                  control={form.control}
                  label="Auto Certificate"
                  name="isAutoGetCertificate"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                }}
                variant="secondary"
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
