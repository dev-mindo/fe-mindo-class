import { IInput } from "@/components/base/IInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { UploadVideo } from "@/lib/service/uploadVideo";
import { progressVideo } from "../page";

type Props = {
  isOpen: boolean;
  setIsOpenDialog?: (isOpen: boolean) => void;
  setUploading?: () => void;
  handleUploadProgress?: (value: progressVideo) => void;
};

export const UploadVideoDialog = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const form = useForm();

  useEffect(() => {
    setIsOpen(props.isOpen);
  }, [props.isOpen]);

  useEffect(() => {
    props.setIsOpenDialog?.(isOpen);
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
    }
  };

  const handleSubmitForm = async (value: any) => {
    // e.preventDefault();
    // TODO: tambahkan logic upload video ke server di sini

    const formData = new FormData();
    formData.append("video", videoFile!);
    formData.append("title", value.title);

    // const uploadVideoRes = await UploadVideo(videoFile!, value.title);

    const res = await fetch("/api/upload-video", {
      method: "POST",
      body: formData,
    });

    const dataResponse = await res.json();

    const dataBody: {
      id: string
      name: string
    } = dataResponse.data

    // handleUploadProgress(res)    

    props.handleUploadProgress({
      id: dataBody.id,
      filename: dataBody.name,
      progress: 0,
    });

    // console.log(uploadVideoRes);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger> */}

      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitForm)}>
            <DialogHeader className="mb-4">
              <DialogTitle>Upload Video</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-3">
                <Label>Title</Label>
                <IInput
                  name="title"
                  control={form.control}
                  type="text"
                  placeholder="title"
                ></IInput>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="video">Video</Label>
                <Input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                />
              </div>

              {/* 👇 Preview video muncul di sini */}
              {videoPreview && (
                <div className="mt-2">
                  <video
                    src={videoPreview}
                    controls
                    className="w-full rounded-lg shadow"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Upload</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
