'use client'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  title: string;
  message: string;
  isOpen: boolean;
  buttonText?: string  
  customFunction?: () => void
  redirectUrl?: string
  setIsOpenDialog?: (isOpen: boolean) => void
};

export const IAlertDialog = (props: Props) => {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)    

    useEffect(() => {      
      setIsOpen(props.isOpen)
    }, [props.isOpen])

    useEffect(() => {
      props.setIsOpenDialog?.(isOpen)
    }, [isOpen])

  return (
    <AlertDialog open={isOpen}>
      {/* <AlertDialogTrigger>Open</AlertDialogTrigger> */}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
          <Button onClick={() => {
            if (props.customFunction) {
              props.customFunction();
            }
            if(props.redirectUrl){
              router.push(props.redirectUrl)
                // window.location.href = props.redirectUrl
            }
            setIsOpen(false)
          }}>{props.buttonText || 'Ok'}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
