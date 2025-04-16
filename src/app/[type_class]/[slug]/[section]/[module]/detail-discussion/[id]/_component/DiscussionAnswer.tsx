import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { EllipsisVertical, Loader2, ThumbsDown, ThumbsUp } from "lucide-react";
import moment from "moment";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Props = {
  discussionDataList: TDiscussionAnswer[];
  discussionId: string;
  setIsOpenAlertDestroy: (open: boolean) => void;
  setAlertDestroyData: (data: { title: string; message: string }) => void;
  isConfirmDestroyAnswer: boolean;
  setConfirmDestroyAnswer: (confirm: boolean) => void;
  setAlertDestroyEvent: (eventTo: string) => void;
  setLoadingDestroy: (loading: boolean) => void;
  setDiscussionAnswerList: (
    value: SetStateAction<TDiscussionAnswer[] | []>
  ) => void;
  discussionStatus: boolean;
};

export const DiscussionAnswer = ({
  discussionDataList,
  discussionId,
  setIsOpenAlertDestroy,
  setAlertDestroyData,
  isConfirmDestroyAnswer,
  setConfirmDestroyAnswer,
  setAlertDestroyEvent,
  setLoadingDestroy,
  setDiscussionAnswerList,
  discussionStatus,
}: Props) => {
  const [editAnswerId, setEditAnswerId] = useState<number>(0);
  const [editAnswerField, setEditAnswerField] = useState<string>("");
  const [answerField, setAnswerField] = useState<string>("");
  const refAnswer = useRef<HTMLTextAreaElement>(null);
  const refEditAnswer = useRef<HTMLTextAreaElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteAnswerId, setDeleteAnswerId] = useState<number>(0);
  const [createAnswerId, setCreateAnswerId] = useState<number>(0);

  useEffect(() => {
    if (createAnswerId > 0) {
      setDiscussionAnswerList((prevItems) => {
        return prevItems.map((item) =>
          item.id === createAnswerId
            ? {
                ...item,
                isUser: item.id === createAnswerId,
              }
            : item
        );
      });
      setCreateAnswerId(0);
    }
    console.log("created data", discussionDataList);
  }, [createAnswerId, discussionDataList]);

  useEffect(() => {
    if (refEditAnswer.current) refEditAnswer.current.value = editAnswerField;
  }, [editAnswerField]);

  useEffect(() => {
    if (refAnswer.current) refAnswer.current.value = answerField;
  }, [answerField]);

  const handleOpenDestroyDialog = () => {
    console.log("show", true);
    setAlertDestroyData({
      title: "Konfirmasi Hapus Tanggapan",
      message: "Apakah kamu yakin menghapus tanggapan?",
    });
    setAlertDestroyEvent("answer");
    setIsOpenAlertDestroy(true);
  };

  const handleCreateDiscussionAnswer = async () => {
    const createDiscussionAnswer: ApiResponse = await fetchApi(
      `/discussion/answer/${discussionId}`,
      {
        method: "POST",
        body: {
          answer: answerField,
        },
      }
    );

    if (createDiscussionAnswer) {
      if (createDiscussionAnswer.success) {
        console.log("create id", createDiscussionAnswer.data.id);
        setCreateAnswerId(createDiscussionAnswer.data.id);
        setAnswerField("");
        toast.success("Discussion Answer Created");
        //TODO create answer (send socket)
      } else {
        toast.error(createDiscussionAnswer.message);
      }
    }
  };

  const handleEditDiscussionAnswer = (
    answerId: number,
    answerField: string
  ) => {
    setEditAnswerId(answerId);
    setEditAnswerField(answerField);
  };

  const handleUpdateDiscussionAnswer = async () => {
    setLoading(true);
    const updateDiscussionAnswer: ApiResponse = await fetchApi(
      `/discussion/answer/${editAnswerId}`,
      {
        method: "PATCH",
        body: {
          answer: editAnswerField,
        },
      }
    );

    if (updateDiscussionAnswer) {
      if (updateDiscussionAnswer.success) {
        setLoading(false);
        setEditAnswerId(0);
        setEditAnswerField("");
        toast.success("Berhasil Memperbaharui Tanggapan");
        //TODO edit answer (send socket)
      } else {
        toast.error(updateDiscussionAnswer.message);
      }
    }
  };

  const handleDestroyDiscussionAnswer = async () => {
    const destroyDiscussionAnswer: ApiResponse = await fetchApi(
      `/discussion/answer/${deleteAnswerId}`,
      {
        method: "DELETE",
      }
    );
    if (destroyDiscussionAnswer) {
      if (destroyDiscussionAnswer.success) {
        setIsOpenAlertDestroy(false);
        setConfirmDestroyAnswer(false);
        setDeleteAnswerId(0);
        toast.success("Tanggapan berhasil dihapus");
        //TODO delete answer (send socket)
      } else {
        toast.error(destroyDiscussionAnswer.message);
      }
      setLoadingDestroy(false);
    }
  };

  useEffect(() => {
    if (isConfirmDestroyAnswer) {
      handleDestroyDiscussionAnswer();
    }
  }, [isConfirmDestroyAnswer]);

  return (
    <>
      {discussionStatus && (
        <div className="p-4 bg-card rounded-lg mt-4">
          <h1>Berikan Tanggapan</h1>
          <div className="mt-4">
            <Textarea
              onChange={(data) => {
                setAnswerField(data.target.value);
              }}
              ref={refAnswer}
              className="h-[10vh]"
              placeholder="Tambahkan Tanggapan"
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={handleCreateDiscussionAnswer}>
              Simpan Tanggapan
            </Button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <h2 className="text-lg">Tanggapan</h2>
        {discussionDataList.length === 0 && (
          <div className="mt-4 text-center">Belum Ada Tanggapan</div>
        )}
        {discussionDataList.map((item) => (
          <div className="p-4 bg-card rounded-lg mt-4">
            <div className="flex justify-between mb-7">
              <div>
                <p
                  className={
                    item.isUser ? "text-green-500 font-bold" : "text-base"
                  }
                >
                  {item.user.name}
                </p>
                <p className="text-sm">
                  {moment(item.createdAt).format("dddd, DD MMMM YYYY")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* <Button variant="secondary">
                  <div className="flex items-center">
                    <ThumbsUp
                      size={20}
                      className={`${
                        item.discussionVote.find(
                          (item) => item.isUser
                        )?.vote === "UP"
                          ? "fill-black dark:fill-white"
                          : ""
                      } `}
                    />
                    <p className="ml-2 text-base">{item.voteSummary.up}</p>
                  </div>
                </Button>
                <Button variant="secondary">
                  <div className="flex items-center">
                    <ThumbsDown
                      size={20}
                      className={`${
                        item.discussionVote.find(
                          (item) => item.isUser
                        )?.vote === "DOWN"
                          ? "fill-black dark:fill-white"
                          : ""
                      } `}
                    />
                    <p className="ml-2 text-base">{item.voteSummary.down}</p>
                  </div>
                </Button> */}
                {discussionStatus && (
                  <>
                    {editAnswerId === item.id && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditAnswerField("");
                            setEditAnswerId(0);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleUpdateDiscussionAnswer}
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
                    )}

                    {item.isUser && (
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <EllipsisVertical />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() =>
                              handleEditDiscussionAnswer(item.id, item.message)
                            }
                            className="cursor-pointer"
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              handleOpenDestroyDialog();
                              setDeleteAnswerId(item.id);
                            }}
                            className="cursor-pointer"
                          >
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                )}
              </div>
            </div>
            <div>
              {item.isUser && editAnswerId === item.id ? (
                <Textarea
                  onChange={(data) => {
                    setEditAnswerField(data.target.value);
                  }}
                  ref={refEditAnswer}
                  className="h-[10vh]"
                  placeholder="Edit Tanggapan"
                />
              ) : (
                <div className="break-all">
                  <p className="text-wrap">{item.message}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
