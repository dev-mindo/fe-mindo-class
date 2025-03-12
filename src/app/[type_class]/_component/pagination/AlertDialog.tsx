import {
  AlertDialog,  
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,  
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  message: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void
};

export const AlertDialogPagination = (props: Props) => {
  return (
    <AlertDialog open={props.isOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
          <Button
            onClick={() => props.setIsOpen(false)}
          >
            Ok
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
