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
  title: string;
  message: String;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  eventTo: string;
  handleDestroyDiscussionQuestion: () => void;
  handleDestroyDiscussionAnswer: (confirm: boolean) => void;
  loading: boolean;
  setDestroyLoading: (loading: boolean) => void;
};

export const ConfirmDialogDeleteDiscussion = ({
  title,
  message,
  isOpen,
  setIsOpen,
  eventTo,
  handleDestroyDiscussionQuestion,
  handleDestroyDiscussionAnswer,
  loading,
  setDestroyLoading,
}: Props) => {
  const handleDestroy = () => {
    setDestroyLoading(true);
    if (eventTo === "question") {
      handleDestroyDiscussionQuestion();
    }
    if (eventTo === "answer") {
      handleDestroyDiscussionAnswer(true);
    }
  };
  return (
    <AlertDialog defaultOpen={false} open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant='outline' disabled={loading} onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button
            disabled={loading}
            onClick={handleDestroy}
            variant="destructive"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                Loading
              </>
            ) : (
              "Hapus"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
