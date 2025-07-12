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
import { useState } from "react";

type Props = {
  isOpen: boolean;
};

export const AlertDialogPageNotLoad = (props: Props) => {
  return (
    <AlertDialog open={props.isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
        <AlertDialogTitle>Informasi</AlertDialogTitle>
          <AlertDialogDescription>
            Halaman Tidak Dapat Dimuat, Silahkan Coba Lagi
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={() => {
              window.location.href =
                process.env.NEXT_PUBLIC_MINDO_MY_CLASS || "";
            }}
            variant="secondary"
            className="text-white bg-secondary hover:bg-secondary/80 dark:bg-secondary dark:hover:bg-secondary/70"
          >
            Kembali ke Kelas Saya
          </Button>
          <Button
            onClick={() => {
              window.location.reload();
            }}
          >
            Coba Lagi
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
