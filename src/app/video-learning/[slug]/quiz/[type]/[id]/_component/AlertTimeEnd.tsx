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
    title: string;
    message: string;
    isOpen: boolean;    
    handleRedirectUrl: () => void
  };
  
  export const AlertTimeEnd = (props: Props) => {
    return (
      <AlertDialog open={props.isOpen}>        
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{props.title}</AlertDialogTitle>
            <AlertDialogDescription>{props.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>            
            <Button onClick={props.handleRedirectUrl}>
              Melanjutkan
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };
  