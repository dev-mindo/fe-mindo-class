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
  question: {
    id: number;
    questionText: string;
  };
  setIsOpenDialog?: (isOpen: boolean) => void;
  handleReset: () => void;
};

export const DestroyQuestionDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(props.isOpen);
  }, [props.isOpen]);

  useEffect(() => {
    props.setIsOpenDialog?.(isOpen);
  }, [isOpen]);

  const destroyQuestion = async () => {
    const destroy: ApiResponse = await fetchApi(
      `/admin/quiz/question/${props.question.id}`,
      {
        method: 'DELETE'
      }
    );

    if (destroy) {
      if (destroy.statusCode === 200) {        
        toast.info(`Data ${props.question.questionText} berhasil dihapus`);
        setIsOpen(false);
        props.handleReset();
      } else {
        toast.error(destroy.message);
      }
    } else {
      toast.error("Data gagal terhapus, kesalahan tidak diketahui");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmas hapus pertanyaan</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah kamu ingin menghapus {props.question.questionText}?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button
            variant={"destructive"}
            onClick={() => {
              destroyQuestion();
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
