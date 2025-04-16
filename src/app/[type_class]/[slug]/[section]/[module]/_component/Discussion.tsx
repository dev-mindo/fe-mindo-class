"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageSquare, Search, ThumbsDown, ThumbsUp } from "lucide-react";
import { NewDialogDiscussion } from "./discussion/NewDiscussionDialog";
import { useEffect, useState } from "react";
import { socket } from "@/lib/service/socket";
import moment from "moment";
import { useRouter } from "next/navigation";

type Props = {
  discussionData: any;
  baseUrl: string;
  moduleId: number;
};

export const Discussion = ({ discussionData, baseUrl, moduleId }: Props) => {
  const [isOpenDiscussionForm, setOpenDiscussionForm] =
    useState<boolean>(false);
  const [discussionDataList, setDiscussionDataList] = useState<any[]>([]);
  const [isSocketConnected, setSocketConnected] = useState(socket.connected);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredData = discussionDataList.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    socket.on("connect", () => {
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("discussionQuestion", (value) => {
      console.log("Socket Data ", value);
      const newDiscussionData = JSON.parse(value).data;

      const messageEvent = JSON.parse(value).messageEvent;

      if (messageEvent === "create") {
        setDiscussionDataList((prevItems) => {
          const alreadyExists = prevItems.some(
            (item) => item.id === newDiscussionData.id
          );
          if (alreadyExists) return prevItems;
          return [newDiscussionData, ...prevItems];
        });
      }

      if (messageEvent === "update") {
        setDiscussionDataList((prevItems) => {
          return prevItems.map((item) =>
            item.id === newDiscussionData.id ? newDiscussionData : item
          );
        });
      }

      if (messageEvent === "destroy") {
        setDiscussionDataList((prevItems) => {
          return prevItems.filter((item) => item.id !== newDiscussionData.id);
        });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("discussionQuestion");
    };
  }, []);

  useEffect(() => {
    console.log('socket connected', isSocketConnected)
  }, [isSocketConnected])

  useEffect(() => {
    setDiscussionDataList(discussionData.data);
  }, [discussionData]);

  useEffect(() => {
    console.log("Discussion ", discussionDataList);
  }, [discussionDataList]);

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex gap-5">
          <div className="flex items-center gap-2 w-full">
            <Search />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search Discussion"
            />
          </div>
          <div>
            <Button onClick={() => setOpenDiscussionForm(true)}>
              Diskusi Baru
            </Button>
            <NewDialogDiscussion
              baseUrl={baseUrl}
              moduleId={moduleId}
              isOpen={isOpenDiscussionForm}
              setIsOpen={setOpenDiscussionForm}
            />
          </div>
        </div>
        <Table>
          <TableCaption>
            {discussionDataList.length === 0 && "Tidak ada diskusi"}
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-full"></TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {discussionDataList.length > 0 &&
              filteredData.map((item) => (
                <TableRow
                  onClick={() => {
                    router.push(`${baseUrl}/detail-discussion/${item.id}`);
                  }}
                >
                  <TableCell className="cursor-pointer">
                    <div>
                      <p className="text-base mb-2">{item.title}</p>
                      <div className="text-small">
                        {moment(item.createdAt).format("dddd, DD MMMM YYYY")} -{" "}
                        {item.user.name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-5">
                      <Badge variant={item.status ? "default" : "destructive"}>
                        {item.status ? "open" : "close"}
                      </Badge>
                      {/* TODO vote */}
                      {/* <div className="flex items-center">
                        <ThumbsUp size={20} />
                        <p className="ml-2 text-base">{item.discussionVote.up}</p>
                      </div>
                      <div className="flex items-center">
                        <ThumbsDown size={20} />
                        <p className="ml-2 text-base">{item.discussionVote.down}</p>
                      </div> */}
                      <div className="flex items-center">
                        <MessageSquare size={20} />
                        <p className="ml-2 text-base">
                          {item._count.discussionAnswer}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
};
