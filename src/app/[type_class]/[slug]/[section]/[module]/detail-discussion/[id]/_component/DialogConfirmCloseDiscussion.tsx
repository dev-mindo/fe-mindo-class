import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  handleCloseDiscussion: () => void;
  loadingCloseDiscussion: boolean;
};

export const DialogConfirmCloseDiscussion = ({
  isOpen,
  setIsOpen,
  handleCloseDiscussion,
  loadingCloseDiscussion,
}: Props) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Penutupan Diskusi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah kamu yakin ingin menutup diskusi?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            disabled={loadingCloseDiscussion}
            onClick={() => setIsOpen(false)}
          >
            Batal
          </Button>
          <Button
            disabled={loadingCloseDiscussion}
            variant="destructive"
            onClick={handleCloseDiscussion}
          >
            {loadingCloseDiscussion ? (
              <>
                <Loader2 className="animate-spin" />
                Loading
              </>
            ) : (
              "Tutup Diskusi"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
