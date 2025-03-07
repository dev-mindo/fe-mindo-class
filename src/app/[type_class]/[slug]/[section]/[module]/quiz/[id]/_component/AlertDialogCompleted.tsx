import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
  import { Button } from "@/components/ui/button";
  
  type Props = {    
    isOpen: boolean;
    handleCompletedQuiz: () => void
    setIsOpen: (open: boolean) => void
  };
  
  export const AlertDialogCompleted = (props: Props) => {
    return (
      <AlertDialog open={props.isOpen}>        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pengerjaan Soal Selesai</AlertDialogTitle>
            <AlertDialogDescription>Apakah Kamu yakin? silahkan cek kembali pengerjaan soal</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant='outline' onClick={() => props.setIsOpen(false)}>
              Batal
            </Button>
            <Button onClick={props.handleCompletedQuiz}>
              Selesai
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  