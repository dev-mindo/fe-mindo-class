import {
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog } from "@radix-ui/react-alert-dialog";
import { useEffect, useState } from "react";

type Props = {
  username: string;
  isOpen: boolean;
  buttonText?: string;
  customFunction?: () => void;
  redirectUrl?: string;
  setIsOpenDialog?: (isOpen: boolean) => void;
};

export const ChatTask = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(props.isOpen);
  }, [props.isOpen]);

  useEffect(() => {
    props.setIsOpenDialog?.(isOpen);
  }, [isOpen]);
  return (
    <AlertDialog open={isOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Chat dengan {props.username}</AlertDialogTitle>
          <AlertDialogDescription>
            <div className="flex flex-col gap-2">
              {/* Contoh pesan admin */}
              <div className="flex justify-start">
                <div
                  className="px-4 py-2 rounded-lg max-w-xs"
                  style={{
                    background: "hsl(var(--secondary))",
                    color: "hsl(var(--secondary-foreground))",
                  }}
                >
                  Halo, ada yang bisa kami bantu?
                </div>
              </div>
              {/* Contoh pesan user */}
              <div className="flex justify-end">
                <div
                  className="px-4 py-2 rounded-lg max-w-xs"
                  style={{
                    background: "hsl(var(--primary))",
                    color: "hsl(var(--primary-foreground))",
                  }}
                >
                  Saya ingin bertanya tentang tugas.
                </div>
              </div>
              {/* Input chat */}
              <div className="flex gap-2 mt-2">
                <Input placeholder="Ketik pesan..." disabled />
                <Button disabled>Kirim</Button>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Kembali
          </Button>
          {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
          {/* <Button
            onClick={() => {
              if (props.customFunction) {
                props.customFunction();
              }
              if (props.redirectUrl) {
                router.push(props.redirectUrl);
                // window.location.href = props.redirectUrl
              }
              setIsOpen(false);
            }}
          >
            Cancel
          </Button> */}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
