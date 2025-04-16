import IInput from "@/components/base/IInput";
import ITextArea from "@/components/base/ITextArea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { socket } from "@/lib/service/socket";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import discussionFormSchema from "@/schemas/DiscussionFormSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type Props = {
  isOpen: boolean;
  setIsOpen: (setOpen: boolean) => void;
  moduleId: number;
  baseUrl: string;
};

export const NewDialogDiscussion = ({
  moduleId,
  setIsOpen,
  isOpen,
  baseUrl,
}: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const discussionFieldSchema = discussionFormSchema.newDiscussionField;

  const form = useForm({
    resolver: zodResolver(discussionFieldSchema),
    defaultValues: {
      title: "",
      question: "",
    },
  });
  const router = useRouter();

  const onSubmit = async (data: z.infer<typeof discussionFieldSchema>) => {
    setLoading(true);
    const res: ApiResponse = await fetchApi(`/discussion/${moduleId}`, {
      method: "POST",
      body: data,
    });

    if (res && res.statusCode === 200) {
      console.log("create disscusion", res.data);
      socket.emit(
        "sendDiscussionQuestion",
        JSON.stringify({
          messageEvent: "create",
          data: res.data
        })
      );
      router.push(`${baseUrl}/detail-discussion/${res.data.id}`);
    } else {
      console.error(res.errorCode);
      toast.error("Internal Error Server");
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!loading) {
            setIsOpen(open);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>Diskusi Baru</DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div>
                <IInput
                  control={form.control}
                  name="title"
                  placeholder="Judul Diskusi"
                />
              </div>
              <div>
                <ITextArea
                  className="h-[20vh]"
                  control={form.control}
                  name="question"
                  placeholder="Diskusi"
                />
              </div>
              <DialogFooter>
                <Button
                  disabled={loading}
                  className="bg-secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button disabled={loading} type="submit">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" /> Loading
                    </>
                  ) : (
                    "Buat Diskusi"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};
