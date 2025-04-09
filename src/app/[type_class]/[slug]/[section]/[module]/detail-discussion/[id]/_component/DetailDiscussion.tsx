import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, ThumbsDown, ThumbsUp } from "lucide-react";

export const DetailDiscussion = () => {
  return (
    <>
      <div className="p-4 bg-card h-[100%] rounded-lg mt-4">
        <div className="flex justify-between mb-7">
          <div>
            <h1 className="text-base mb-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </h1>
            <p className="text-small">Ivan - Kamis 3 April 2025</p>
          </div>
          <div className="flex items-center gap-5">
            <Badge>Open</Badge>
            <div className="flex items-center">
              <ThumbsUp size={20} />
              <p className="ml-2 text-base">5</p>
            </div>
            <div className="flex items-center">
              <MessageSquare size={20} />
              <p className="ml-2 text-base">5</p>
            </div>
            <div className="flex gap-2">
              <Button>Edit</Button>
              <Button variant="destructive">Tutup Diskusi</Button>
            </div>
          </div>
        </div>
        <div className="border p-4 rounded-lg border-foreground mb-7">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged.
        </div>
        <div>
          <h1>Berikan Komentar</h1>
          <div className="mt-4">
            <Textarea className="h-[10vh]" placeholder="Tambahkan Komentar" />
          </div>
          <div className="flex justify-end mt-4">
            <Button>Komentar</Button>            
          </div>
        </div>
      </div>
    </>
  );
};
