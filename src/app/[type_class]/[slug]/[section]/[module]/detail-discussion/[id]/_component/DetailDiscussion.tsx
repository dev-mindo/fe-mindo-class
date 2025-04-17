"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { socket } from "@/lib/service/socket";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import {
  EllipsisVertical,
  Loader2,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import moment from "moment";
import { notFound, useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { DiscussionAnswer, SocketAnswerData } from "./DiscussionAnswer";
import { ConfirmDialogDeleteDiscussion } from "./DialogConfirmDeleteDiscussion";
import { DialogConfirmCloseDiscussion } from "./DialogConfirmCloseDiscussion";

type Props = {
  detailDiscussionDataProps: TDetailDiscussion | undefined;
};

export const DetailDiscussion = ({ detailDiscussionDataProps }: Props) => {
  const params = useParams<{
    id: string;
    type_class: string;
    section: string;
    slug: string;
    module: string;
  }>();
  const baseUrl = `${process.env.NEXT_PUBLIC_URL}/${params.type_class}/${params.slug}/${params.section}/${params.module}`;
  const router = useRouter();
  const [detailDiscussionData, setDetailDiscussionData] = useState<
    TDetailDiscussion | undefined
  >(detailDiscussionDataProps);

  const [discussionAnswerList, setDiscussionAnswerList] = useState<
    TDiscussionAnswer[] | []
  >([]);
  const [isSocketConnected, setSocketConnected] = useState(socket.connected);
  const [isEditQuestion, setEditQuestion] = useState<boolean>(false);
  const [editQuestionField, setEditQuestionField] = useState<{
    title: string;
    question: string;
  }>({
    question: "",
    title: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingPage, setLoadingPage] = useState<boolean>(true);

  const [isOpenAlertDestroy, setIsOpenAlertDestroy] = useState<boolean>(false);
  const [alertDestroyData, setAlertDestroyData] = useState<{
    title: string;
    message: string;
  }>();
  const [alertDestroyEvent, setAlertDestroyEvent] = useState<string>("");
  const [isConfirmDestroyAnswer, setConfirmDestroyAnswer] = useState(false);
  const [isLoadingDestroy, setLoadingDestroy] = useState<boolean>(false);
  const [errorQuestionField, setErrorQuestionField] = useState<{
    title: string;
    question: string;
  }>({
    question: "",
    title: "",
  });
  const [dialogConfirmCloseDiscussion, setDialogConfirmCloseDiscussion] =
    useState<boolean>(false);
  const [loadingCloseDiscussion, setLoadingCloseDiscussion] =
    useState<boolean>(false);
  const [answerSocketData, setAnswerSocketData] = useState<SocketAnswerData>(null)

  const handleEditQuestionField = () => {
    setEditQuestion(true);
    setEditQuestionField({
      question: detailDiscussionData?.question || "",
      title: detailDiscussionData?.title || "",
    });
  };

  const handleUpdateDiscussionQuestion = async () => {
    setLoading(true);
    const updateDiscussion: ApiResponse = await fetchApi(
      `/discussion/update/${params.id}`,
      {
        method: "PATCH",
        body: editQuestionField,
      }
    );

    if (updateDiscussion) {
      if (updateDiscussion.statusCode === 200) {
        console.log("is user", detailDiscussionData?.isUser);
        socket.emit(
          "sendDiscussionQuestion",
          JSON.stringify({
            messageEvent: "update",
            data: updateDiscussion.data,
          })
        );
        socket.emit(
          "sendDiscussionAnswer",
          JSON.stringify({
            messageEvent: "update",
            eventTo: "question",
            data: {
              ...updateDiscussion.data,
              isUser: false,
            },
          })
        );
        setDetailDiscussionData({
          ...updateDiscussion.data,
          isUser: true,
        });
        setLoading(false);
        setEditQuestion(false);
        toast.success(updateDiscussion.message);
      }

      if (updateDiscussion.statusCode === 404) {
        toast.error(updateDiscussion.message);
        setLoading(false);
      }
    }
  };

  const handleDestroyShowConfirm = () => {
    setAlertDestroyData({
      title: "Konfirmasi Hapus Diskusi",
      message: "Apakah kamu yakin menghapus Diskusi?",
    });
    setAlertDestroyEvent("question");
    setIsOpenAlertDestroy(true);
  };

  const handleDestroyDiscussionQuestion = async () => {
    const deleteDiscussion: ApiResponse = await fetchApi(
      `/discussion/destroy/${params.id}`,
      {
        method: "DELETE",
      }
    );

    if (deleteDiscussion) {
      if (deleteDiscussion) {
        setIsOpenAlertDestroy(false);
        setLoadingDestroy(false);
        //TODO send socket
        socket.emit(
          "sendDiscussionQuestion",
          JSON.stringify({
            messageEvent: "destroy",
            data: {
              id: params.id,
            },
          })
        );

        socket.emit(
          "sendDiscussionAnswer",
          JSON.stringify({
            messageEvent: "destroy",
            eventTo: "question",
            data: {
              id: params.id,
            },
          })
        );

        //TODO destroy data
        router.push(baseUrl);
      }
      if (deleteDiscussion.statusCode !== 200) {
        toast.error("Deleted Failed");
      }
    }
  };

  const handleCloseDiscussion = async () => {
    setLoadingCloseDiscussion(true);
    const updateDiscussion: ApiResponse = await fetchApi(
      `/discussion/close/${params.id}`,
      {
        method: "PATCH",
      }
    );

    if (updateDiscussion) {
      if (updateDiscussion.statusCode === 200) {
        toast.success(updateDiscussion.message);
      }

      if (updateDiscussion.statusCode === 404) {
        toast.error(updateDiscussion.message);
      }
      setLoadingCloseDiscussion(false);
    }
  };

  useEffect(() => {
    console.log('discussion data list', discussionAnswerList)
  }, [discussionAnswerList])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const pointer = getComputedStyle(document.body).pointerEvents;
      if (pointer === "none") {
        console.warn("pointer-events masih none, memulihkan...");
        document.body.style.pointerEvents = "auto";
      }
    });

    observer.observe(document.body, { attributes: true });

    if (detailDiscussionData) {
      console.log("detail discussion data", detailDiscussionData);
      setLoadingPage(false);
      setDiscussionAnswerList(detailDiscussionData?.discussionAnswer || []);
    } else {
      router.push(baseUrl);
    }

    socket.on("connect", () => {
      setSocketConnected(true);      
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("discussionAnswer", (value) => {
      const discussionData = JSON.parse(value).data;
      const messageEvent = JSON.parse(value).messageEvent;
      const eventTo = JSON.parse(value).eventTo;

      console.log("detail discussion user", detailDiscussionData);
      if (eventTo === "question" && detailDiscussionDataProps?.isUser === false) {
        console.log("Socket Data ", value);
        if (messageEvent === "update") {
          setDetailDiscussionData(discussionData);
        }

        if (messageEvent === "destroy") {
          setDetailDiscussionData(undefined);
          router.push(baseUrl);
        }
      }

      if (eventTo === "answer") {
        setAnswerSocketData(JSON.parse(value))
      }
    });

    socket.on("discussionVote", (value) => {
      const dataDiscussionVote = JSON.parse(value);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");      
      socket.off("discussionAnswer");
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    console.log("detail discussion", detailDiscussionData);
  }, [detailDiscussionData]);

  if (loadingPage) {
    return (
      <div className="flex flex-col w-[80%] mx-auto">
        <Skeleton className="h-6 w-full rounded-xl mb-4" />
        <Skeleton className="h-5 w-[302px] rounded-xl mb-4" />
        <Skeleton className="h-[128px] w-full rounded-xl mb-4" />
        <Skeleton className="h-[128px] w-full rounded-xl mb-4" />
        <Skeleton className="h-5 w-[100px] rounded-xl mb-4" />
        <Skeleton className="h-[128px] w-full rounded-xl mb-4" />
        <Skeleton className="h-[128px] w-full rounded-xl mb-4" />
      </div>
    );
  }

  return (
    <div className="w-[80%] mx-auto">
      <div className="flex justify-between mb-4 gap-4">
        <div>
          {isEditQuestion ? (
            <Input
              onChange={(data) => {
                setEditQuestionField({
                  title: data.target.value,
                  question: editQuestionField.question,
                });
              }}
              className="mb-3"
              defaultValue={detailDiscussionData?.title}
            />
          ) : (
            <h1 className="text-2xl mb-3">{detailDiscussionData?.title}</h1>
          )}
          <div className="flex items-center gap-4">
            <div>
              <Badge
                variant={
                  detailDiscussionData?.status ? "default" : "destructive"
                }
              >
                {detailDiscussionData?.status ? "open" : "close"}
              </Badge>
            </div>
            <div className="flex gap-4 items-center">
              {/* <div className="flex items-center">
                <ThumbsUp size={20} />
                <p className="ml-2 text-base">
                  {detailDiscussionData?.totalDiscussionVote.up}
                </p>
              </div>
              <div className="flex items-center">
                <ThumbsDown size={20} />
                <p className="ml-2 text-base">
                  {detailDiscussionData?.totalDiscussionVote.down}
                </p>
              </div> */}
              <div className="flex items-center">
                <MessageSquare size={20} />
                <p className="ml-2 text-base">
                  {detailDiscussionData?._count.discussionAnswer}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {detailDiscussionData?.isUser && detailDiscussionData.status && (
            <>
              <Button
                variant="destructive"
                onClick={() => setDialogConfirmCloseDiscussion(true)}
              >
                Tutup Diskusi
              </Button>
              <DialogConfirmCloseDiscussion
                loadingCloseDiscussion={loadingCloseDiscussion}
                handleCloseDiscussion={handleCloseDiscussion}
                isOpen={dialogConfirmCloseDiscussion}
                setIsOpen={setDialogConfirmCloseDiscussion}
              />
            </>
          )}
          <Button
            variant="outline"
            onClick={() => {
              router.push(baseUrl);
            }}
          >
            Kembali
          </Button>
        </div>
      </div>
      <div className="flex gap-4">
        <div className="w-full">
          <div className="p-4 bg-card rounded-lg mt-4">
            <div className="flex justify-between mb-7">
              <div>
                <p className="text-green-500 font-bold">
                  {detailDiscussionData?.user.name}
                </p>
                <p className="text-sm">
                  {moment(detailDiscussionData?.createdAt).format(
                    "dddd, DD MMMM YYYY"
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* TODO vote */}
                {/* <Button variant="secondary">
                  <div className="flex items-center">
                    <ThumbsUp
                      size={20}
                      className={`${
                        detailDiscussionData?.discussionVote.find(
                          (item) => item.isUser
                        )?.vote === "UP"
                          ? "fill-black dark:fill-white"
                          : ""
                      } `}
                    />
                    <p className="ml-2 text-base">
                      {detailDiscussionData?.voteSummary.up}
                    </p>
                  </div>
                </Button>
                <Button variant="secondary">
                  <div className="flex items-center">
                    <ThumbsDown
                      size={20}
                      className={`${
                        detailDiscussionData?.discussionVote.find(
                          (item) => item.isUser
                        )?.vote === "DOWN"
                          ? "fill-black dark:fill-white"
                          : ""
                      } `}
                    />
                    <p className="ml-2 text-base">
                      {detailDiscussionData?.voteSummary.down}
                    </p>
                  </div>
                </Button> */}
                {detailDiscussionData?.status && (
                  <div className="flex gap-2">
                    {isEditQuestion ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditQuestion(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateDiscussionQuestion}
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="animate-spin" />
                              Loading
                            </>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    ) : detailDiscussionData?.isUser ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={handleEditQuestionField}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDestroyShowConfirm}
                            className="cursor-pointer"
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <></>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div>
              {isEditQuestion ? (
                <Textarea
                  className="h-[10vh]"
                  defaultValue={detailDiscussionData?.question}
                  onChange={(data) => {
                    setEditQuestionField({
                      title: editQuestionField.title,
                      question: data.target.value,
                    });
                  }}
                />
              ) : (
                detailDiscussionData?.question
              )}
            </div>
          </div>

          <DiscussionAnswer
            socketAnswerData={answerSocketData}
            discussionStatus={detailDiscussionData?.status || false}
            setDiscussionAnswerList={setDiscussionAnswerList}
            setLoadingDestroy={setLoadingDestroy}
            setAlertDestroyEvent={setAlertDestroyEvent}
            isConfirmDestroyAnswer={isConfirmDestroyAnswer}
            setConfirmDestroyAnswer={setConfirmDestroyAnswer}
            setAlertDestroyData={setAlertDestroyData}
            setIsOpenAlertDestroy={setIsOpenAlertDestroy}
            discussionDataList={discussionAnswerList}
            discussionId={params.id}
          />
        </div>
        {/* <div>
          <div className="w-[50vh]">
            <div className="text-base mt-4 text-center">Diskusi Teratas</div>
          </div>
        </div> */}
      </div>
      <ConfirmDialogDeleteDiscussion
        loading={isLoadingDestroy}
        setDestroyLoading={setLoadingDestroy}
        eventTo={alertDestroyEvent}
        isOpen={isOpenAlertDestroy}
        message={alertDestroyData?.message || ""}
        setIsOpen={setIsOpenAlertDestroy}
        title={alertDestroyData?.title || ""}
        handleDestroyDiscussionQuestion={handleDestroyDiscussionQuestion}
        handleDestroyDiscussionAnswer={setConfirmDestroyAnswer}
      />
    </div>
  );
};
