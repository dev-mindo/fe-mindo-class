import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";

type Props = {
  isOpen: boolean;
  setIsOpenDialog?: (isOpen: boolean) => void;
  setUploading?: () => void;
  videoId: string
};

export const PreviewVideo = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>()

  

  useEffect(() => {
    setIsOpen(props.isOpen);
  }, [props.isOpen]);

  useEffect(() => {
    props.setIsOpenDialog?.(isOpen);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger> */}

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="mb-4">
          <DialogTitle>Preview Video</DialogTitle>
        </DialogHeader>
        <div className="mb-2">

        </div>
         {props.videoUrl && (
          <div className="lg:w-[70%]">
            <div className="relative pt-[56.25%] absolute top-0 left-0 w-full h-full">
              <iframe
                src={`${props.videoUrl}&autoplay=false&loop=false&muted=false&preload=true&responsive=false`}
                loading="lazy"
                className="border-0 absolute top-0 h-full w-full"
                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
