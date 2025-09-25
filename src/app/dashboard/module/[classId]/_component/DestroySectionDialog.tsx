"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  section: {
    id: number;
    title: string;
  };
  setIsOpenDialog?: (isOpen: boolean) => void;
  getClassModule: () => void;
};

export const DestroySectionDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(props.isOpen);
  }, [props.isOpen]);

  useEffect(() => {
    props.setIsOpenDialog?.(isOpen);
  }, [isOpen]);

  const destroySection = async () => {
    const destroy: ApiResponse = await fetchApi(
      `/admin/section/${props.section.id}`,
      {
        method: "DELETE",
      }
    );

    if (destroy) {
      if (destroy.statusCode === 200) {
        toast.info(`Data ${props.section.title} berhasil dihapus`);
        setIsOpen(false);
        props.getClassModule();
      } else {
        toast.error(destroy.message);
      }
    } else {
      toast.error("Data gagal terhapus, kesalahan tidak diketahui");
    }
  };

  return (
    <AlertDialog open={isOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmas hapus modul</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah kamu ingin menghapus {props.section.title}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            onClick={() => {
              destroySection();
              setIsOpen(false);
            }}
          >
            Hapus
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
