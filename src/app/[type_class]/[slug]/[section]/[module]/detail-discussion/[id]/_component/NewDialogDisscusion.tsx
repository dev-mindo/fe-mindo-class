import IInput from "@/components/base/IInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,  
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/utils/fetchApi";
import { useRouter } from "next/navigation";
import { Form, useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  setIsOpen: (setOpen: boolean) => void;
};

export const NewDialogDiscussion = ({ setIsOpen, isOpen }: Props) => {
  const form = useForm();
  const router = useRouter()

  const onSubmit = async (data: any) => {
    await fetchApi("")
      .then((data) => {
        router.push('')
      }).catch((error) => {
        console.error(error)
        toast.error('Internal Error Server')
      });
  };

  return (
    <>
      <Dialog open={isOpen}>
        <DialogContent>
          <DialogHeader>Diskusi Baru</DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col">
                <div>
                  <IInput control={form.control} name="title" />
                </div>
                <div>
                  <IInput control={form.control} name="discussion" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit">Simpan</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
