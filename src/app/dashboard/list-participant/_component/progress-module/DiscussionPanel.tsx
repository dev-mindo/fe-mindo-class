import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ApiResponse } from "@/lib/utils/fetchApi";
import { subscribeDiscussionDetail } from "@/lib/service/discussionRealtime";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  LockKeyhole,
  MessageCircle,
  MessageSquare,
  MessageSquareText,
  Pencil,
  Send,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DiscussionOrder, DiscussionStatusFilter } from "./types";
import { formatDateTime } from "./utils";

type Props = {
  moduleId: number;
  moduleDiscussions: Record<number, TModuleDiscussion>;
  selectedDiscussionDetail: TDetailDiscussion | null;
  setSelectedDiscussionDetail: (detail: TDetailDiscussion | null) => void;
  isLoadingDiscussion: boolean;
  isLoadingDiscussionDetail: boolean;
  discussionStatusFilter: DiscussionStatusFilter;
  setDiscussionStatusFilter: (filter: DiscussionStatusFilter) => void;
  discussionOrder: DiscussionOrder;
  setDiscussionOrder: (order: DiscussionOrder) => void;
  paginatedDiscussions: TModuleDiscussion;
  filteredDiscussions: TModuleDiscussion;
  discussionPage: number;
  discussionTotalPage: number;
  discussionPaginationPages: number[];
  setDiscussionPage: (page: number | ((page: number) => number)) => void;
  handleShowDiscussionDetail: (discussionId: number) => void;
  handleCreateDiscussionAnswer: (
    discussionId: number,
    answer: string,
  ) => Promise<ApiResponse<TDiscussionAnswer>>;
  handleUpdateDiscussionAnswer: (
    discussionId: number,
    answerId: number,
    answer: string,
  ) => Promise<ApiResponse<TDiscussionAnswer>>;
  handleDeleteDiscussionAnswer: (
    discussionId: number,
    answerId: number,
  ) => Promise<ApiResponse>;
  handleCloseDiscussion: (
    discussionId: number,
  ) => Promise<ApiResponse<TDetailDiscussion>>;
  handleDeleteDiscussion: (
    discussionId: number,
  ) => Promise<ApiResponse>;
};

export const DiscussionPanel = ({
  moduleId,
  moduleDiscussions,
  selectedDiscussionDetail,
  setSelectedDiscussionDetail,
  isLoadingDiscussion,
  isLoadingDiscussionDetail,
  discussionStatusFilter,
  setDiscussionStatusFilter,
  discussionOrder,
  setDiscussionOrder,
  paginatedDiscussions,
  filteredDiscussions,
  discussionPage,
  discussionTotalPage,
  discussionPaginationPages,
  setDiscussionPage,
  handleShowDiscussionDetail,
  handleCreateDiscussionAnswer,
  handleUpdateDiscussionAnswer,
  handleDeleteDiscussionAnswer,
  handleCloseDiscussion,
  handleDeleteDiscussion,
}: Props) => {
  const [answer, setAnswer] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [newMessage, setNewMessage] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<
    "close" | "delete" | null
  >(null);
  const [isUpdatingDiscussion, setIsUpdatingDiscussion] = useState(false);
  const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
  const [editingAnswer, setEditingAnswer] = useState("");
  const [deletingAnswerId, setDeletingAnswerId] = useState<number | null>(
    null,
  );
  const [isUpdatingAnswer, setIsUpdatingAnswer] = useState(false);
  const notificationTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    setAnswer("");
  }, [selectedDiscussionDetail?.id]);

  useEffect(() => {
    const discussionId = selectedDiscussionDetail?.id;

    if (!discussionId) return;

    const unsubscribe = subscribeDiscussionDetail(
      discussionId,
      (event) => {
        if (
          event.entity !== "answer" ||
          event.action !== "create" ||
          event.source !== "participant"
        ) {
          return;
        }

        const eventData = event.data as
          | {
              author?: { name?: string } | null;
              user?: { name?: string } | null;
            }
          | undefined;
        const senderName =
          eventData?.author?.name ||
          eventData?.user?.name ||
          "Peserta";

        setNewMessage(`Pesan baru dari ${senderName}`);

        if (notificationTimer.current) {
          clearTimeout(notificationTimer.current);
        }

        notificationTimer.current = setTimeout(() => {
          setNewMessage(null);
        }, 5000);
      },
    );

    return () => {
      unsubscribe();

      if (notificationTimer.current) {
        clearTimeout(notificationTimer.current);
      }
    };
  }, [selectedDiscussionDetail?.id]);

  const submitAnswer = async () => {
    if (!selectedDiscussionDetail) return;

    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      toast.error("Tanggapan tidak boleh kosong.");
      return;
    }

    setIsSubmittingAnswer(true);

    try {
      const response = await handleCreateDiscussionAnswer(
        selectedDiscussionDetail.id,
        trimmedAnswer,
      );

      if (response.success) {
        setAnswer("");
        toast.success(response.message || "Tanggapan berhasil dikirim.");
      } else {
        toast.error(response.message || "Tanggapan gagal dikirim.");
      }
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const confirmDiscussionAction = async () => {
    if (!selectedDiscussionDetail || !confirmationAction) return;

    setIsUpdatingDiscussion(true);

    try {
      const response =
        confirmationAction === "close"
          ? await handleCloseDiscussion(selectedDiscussionDetail.id)
          : await handleDeleteDiscussion(selectedDiscussionDetail.id);

      if (response.success) {
        toast.success(
          response.message ||
            (confirmationAction === "close"
              ? "Diskusi berhasil ditutup."
              : "Diskusi berhasil dihapus."),
        );
        setConfirmationAction(null);
        return;
      }

      toast.error(
        response.message ||
          (confirmationAction === "close"
            ? "Diskusi gagal ditutup."
            : "Diskusi gagal dihapus."),
      );
    } finally {
      setIsUpdatingDiscussion(false);
    }
  };

  const submitEditedAnswer = async () => {
    if (!selectedDiscussionDetail || !editingAnswerId) return;

    const trimmedAnswer = editingAnswer.trim();

    if (!trimmedAnswer) {
      toast.error("Tanggapan tidak boleh kosong.");
      return;
    }

    setIsUpdatingAnswer(true);

    try {
      const response = await handleUpdateDiscussionAnswer(
        selectedDiscussionDetail.id,
        editingAnswerId,
        trimmedAnswer,
      );

      if (response.success) {
        setEditingAnswerId(null);
        setEditingAnswer("");
        toast.success(response.message || "Pesan berhasil diperbarui.");
      } else {
        toast.error(response.message || "Pesan gagal diperbarui.");
      }
    } finally {
      setIsUpdatingAnswer(false);
    }
  };

  const confirmDeleteAnswer = async () => {
    if (!selectedDiscussionDetail || !deletingAnswerId) return;

    setIsUpdatingAnswer(true);

    try {
      const response = await handleDeleteDiscussionAnswer(
        selectedDiscussionDetail.id,
        deletingAnswerId,
      );

      if (response.success) {
        setDeletingAnswerId(null);
        toast.success(response.message || "Pesan berhasil dihapus.");
      } else {
        toast.error(response.message || "Pesan gagal dihapus.");
      }
    } finally {
      setIsUpdatingAnswer(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "-";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getVoteSummary = (votes?: Array<TDiscussionVote>) => {
    return (votes ?? []).reduce(
      (summary, vote) => {
        const voteValue = vote.vote.toLowerCase();

        if (voteValue === "up") summary.up += 1;
        if (voteValue === "down") summary.down += 1;
        return summary;
      },
      { up: 0, down: 0 },
    );
  };

  const selectedDiscussionVotes =
    selectedDiscussionDetail?.voteSummary ??
    getVoteSummary(selectedDiscussionDetail?.discussionVote);

  return (
    <div className="flex h-full min-h-0 flex-col border-t">
      <div className="grid h-full min-h-0 grid-rows-[minmax(260px,0.85fr)_minmax(360px,1.15fr)] lg:grid-cols-[360px_minmax(0,1fr)] lg:grid-rows-none">
        <div className="flex min-h-0 flex-col border-b lg:border-b-0 lg:border-r">
          <div className="shrink-0 p-3">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">Diskusi</h3>
                <p className="text-xs text-muted-foreground">
                  Daftar diskusi pada module ini.
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                {moduleDiscussions[moduleId]?.length ?? 0} diskusi
              </Badge>
            </div>

            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-3 gap-1">
                {(["all", "open", "close"] as DiscussionStatusFilter[]).map(
                  (filter) => (
                    <Button
                      key={filter}
                      type="button"
                      size="sm"
                      variant={
                        discussionStatusFilter === filter
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setDiscussionStatusFilter(filter)}
                    >
                      {filter === "all"
                        ? "Semua"
                        : filter === "open"
                          ? "Open"
                          : "Close"}
                    </Button>
                  ),
                )}
              </div>
              <Select
                value={discussionOrder}
                onValueChange={(value) =>
                  setDiscussionOrder(value as DiscussionOrder)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Terbaru</SelectItem>
                  <SelectItem value="asc">Terlama</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
            {isLoadingDiscussion ? (
              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                Memuat diskusi...
              </div>
            ) : paginatedDiscussions.length ? (
              <div className="space-y-2">
                {paginatedDiscussions.map((discussion) => {
                  const isSelected =
                    selectedDiscussionDetail?.id === discussion.id;

                  return (
                    <button
                      key={discussion.id}
                      type="button"
                      disabled={isLoadingDiscussionDetail}
                      onClick={() => handleShowDiscussionDetail(discussion.id)}
                      className={`w-full rounded-md border p-3 text-left transition hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-70 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "bg-background"
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">
                            {discussion.title}
                          </p>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {discussion.user.name}
                          </p>
                        </div>
                        <Badge
                          variant={
                            discussion.status ? "default" : "destructive"
                          }
                          className="shrink-0"
                        >
                          {discussion.status ? "open" : "close"}
                        </Badge>
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {discussion.question}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{formatDateTime(discussion.createdAt)}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {discussion._count.discussionAnswer}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                Diskusi tidak ditemukan pada filter ini.
              </div>
            )}
          </div>

          <div className="shrink-0 border-t p-3">
            <p className="mb-2 text-xs text-muted-foreground">
              Menampilkan {paginatedDiscussions.length} dari{" "}
              {filteredDiscussions.length} diskusi
            </p>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={discussionPage === 1}
                onClick={() => setDiscussionPage((page) => page - 1)}
              >
                Previous
              </Button>
              {discussionPaginationPages.map((page) => (
                <Button
                  key={page}
                  type="button"
                  size="sm"
                  variant={page === discussionPage ? "default" : "outline"}
                  onClick={() => setDiscussionPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={discussionPage === discussionTotalPage}
                onClick={() => setDiscussionPage((page) => page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-col bg-muted/30">
          {selectedDiscussionDetail ? (
            <>
              {newMessage ? (
                <div className="absolute right-4 top-4 z-20 flex max-w-xs items-start gap-3 rounded-lg border bg-background px-4 py-3 shadow-lg">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold">New message</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {newMessage}
                    </p>
                  </div>
                  <button
                    aria-label="Tutup notifikasi pesan"
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => setNewMessage(null)}
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : null}
              <div className="shrink-0 border-b bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {getInitials(selectedDiscussionDetail.user.name)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold">
                          {selectedDiscussionDetail.title}
                        </h4>
                        <p className="truncate text-xs text-muted-foreground">
                          {selectedDiscussionDetail.user.name}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          selectedDiscussionDetail.status
                            ? "default"
                            : "destructive"
                        }
                      >
                        {selectedDiscussionDetail.status ? "open" : "close"}
                      </Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {selectedDiscussionDetail._count.discussionAnswer}{" "}
                        jawaban
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {selectedDiscussionVotes.up}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ThumbsDown className="h-3.5 w-3.5" />
                        {selectedDiscussionVotes.down}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {selectedDiscussionDetail.status ? (
                      <Button
                        aria-label="Tutup diskusi"
                        className="h-8 w-8"
                        onClick={() => setConfirmationAction("close")}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        <LockKeyhole className="h-4 w-4" />
                      </Button>
                    ) : null}
                    <Button
                      aria-label="Hapus diskusi"
                      className="h-8 w-8"
                      onClick={() => setConfirmationAction("delete")}
                      size="icon"
                      type="button"
                      variant="destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setSelectedDiscussionDetail(null)}
                      aria-label="Tutup detail diskusi"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
                <div className="flex items-end gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground shadow-sm">
                    {getInitials(selectedDiscussionDetail.user.name)}
                  </div>
                  <div className="max-w-[82%] rounded-2xl rounded-bl-sm bg-background px-4 py-3 shadow-sm">
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-xs font-semibold text-primary">
                        {selectedDiscussionDetail.user.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {formatDateTime(selectedDiscussionDetail.createdAt)}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedDiscussionDetail.question}
                    </p>
                  </div>
                </div>

                {selectedDiscussionDetail.discussionAnswer.length ? (
                  selectedDiscussionDetail.discussionAnswer.map((answer) => {
                    const isCurrentStaff = answer.isUser;
                    const authorName =
                      answer.author?.name ||
                      answer.user?.name ||
                      "Pengguna";
                    const authorType =
                      answer.author?.type === "PESERTA"
                        ? "Peserta"
                        : answer.author?.type || "Staf";
                    const answerVotes =
                      answer.voteSummary ??
                      getVoteSummary(answer.discussionVote);

                    return (
                      <div
                        key={answer.id}
                        className={`flex items-end gap-2 ${
                          isCurrentStaff ? "justify-end" : "justify-start"
                        }`}
                      >
                        {!isCurrentStaff ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground shadow-sm">
                            {getInitials(authorName)}
                          </div>
                        ) : null}
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                            isCurrentStaff
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm bg-background"
                          }`}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p
                              className={`text-xs font-semibold ${
                                isCurrentStaff ? "" : "text-primary"
                              }`}
                            >
                              {authorName}
                            </p>
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                                isCurrentStaff
                                  ? "bg-primary-foreground/15 text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {authorType}
                            </span>
                            <p
                              className={`text-[11px] ${
                                isCurrentStaff
                                  ? "text-primary-foreground/75"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {formatDateTime(answer.createdAt)}
                            </p>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">
                            {editingAnswerId === answer.id ? (
                              <Textarea
                                className="min-h-20 min-w-[280px] resize-none bg-background text-foreground"
                                disabled={isUpdatingAnswer}
                                onChange={(event) =>
                                  setEditingAnswer(event.target.value)
                                }
                                value={editingAnswer}
                              />
                            ) : (
                              answer.message
                            )}
                          </div>
                          {isCurrentStaff ? (
                            <div className="mt-3 flex justify-end gap-2">
                              {editingAnswerId === answer.id ? (
                                <>
                                  <Button
                                    disabled={isUpdatingAnswer}
                                    onClick={() => {
                                      setEditingAnswerId(null);
                                      setEditingAnswer("");
                                    }}
                                    size="sm"
                                    type="button"
                                    variant="secondary"
                                  >
                                    Batal
                                  </Button>
                                  <Button
                                    disabled={
                                      !editingAnswer.trim() ||
                                      isUpdatingAnswer
                                    }
                                    onClick={submitEditedAnswer}
                                    size="sm"
                                    type="button"
                                    variant="secondary"
                                  >
                                    {isUpdatingAnswer ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Simpan"
                                    )}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    aria-label="Edit pesan"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setEditingAnswerId(answer.id);
                                      setEditingAnswer(answer.message);
                                    }}
                                    size="icon"
                                    type="button"
                                    variant="secondary"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    aria-label="Hapus pesan"
                                    className="h-7 w-7"
                                    onClick={() =>
                                      setDeletingAnswerId(answer.id)
                                    }
                                    size="icon"
                                    type="button"
                                    variant="destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          ) : null}
                          <div
                            className={`mt-2 flex items-center gap-3 text-[11px] ${
                              isCurrentStaff
                                ? "text-primary-foreground/75"
                                : "text-muted-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              {answerVotes.up}
                            </span>
                            <span className="flex items-center gap-1">
                              <ThumbsDown className="h-3 w-3" />
                              {answerVotes.down}
                            </span>
                          </div>
                        </div>
                        {isCurrentStaff ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm">
                            {getInitials(authorName)}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div className="mx-auto flex max-w-sm flex-col items-center rounded-md border border-dashed bg-background p-5 text-center text-sm text-muted-foreground">
                    <MessageCircle className="mb-2 h-5 w-5" />
                    Belum ada jawaban pada diskusi ini.
                  </div>
                )}
              </div>

              <div className="shrink-0 border-t bg-background p-4 shadow-[0_-8px_18px_rgba(15,23,42,0.06)]">
                {selectedDiscussionDetail.status ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">
                          Kirim tanggapan
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Balasan akan ditampilkan kepada peserta.
                        </p>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        Admin
                      </Badge>
                    </div>
                    <Textarea
                      className="min-h-24 resize-none bg-muted/30"
                      disabled={isSubmittingAnswer}
                      onChange={(event) => setAnswer(event.target.value)}
                      placeholder="Tulis tanggapan untuk diskusi ini..."
                      value={answer}
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs text-muted-foreground">
                        Pastikan tanggapan sudah sesuai sebelum dikirim.
                      </p>
                      <Button
                        className="w-full sm:w-auto"
                        disabled={!answer.trim() || isSubmittingAnswer}
                        onClick={submitAnswer}
                        type="button"
                      >
                        {isSubmittingAnswer ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Mengirim...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Kirim Tanggapan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-3 text-center text-sm text-muted-foreground">
                    Diskusi telah ditutup dan tidak dapat dibalas.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] flex-1 items-center justify-center p-6 text-center">
              <div className="max-w-sm">
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold">Pilih diskusi</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Klik salah satu diskusi untuk melihat percakapan peserta pada
                  module ini.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <AlertDialog
        open={confirmationAction !== null}
        onOpenChange={(open) => {
          if (!open && !isUpdatingDiscussion) {
            setConfirmationAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmationAction === "close"
                ? "Tutup diskusi?"
                : "Hapus diskusi?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationAction === "close"
                ? "Peserta tidak dapat menambahkan balasan baru setelah diskusi ditutup."
                : "Diskusi beserta seluruh balasannya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingDiscussion}>
              Batal
            </AlertDialogCancel>
            <Button
              disabled={isUpdatingDiscussion}
              onClick={confirmDiscussionAction}
              type="button"
              variant="destructive"
            >
              {isUpdatingDiscussion ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : confirmationAction === "close" ? (
                "Tutup Diskusi"
              ) : (
                "Hapus Diskusi"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={deletingAnswerId !== null}
        onOpenChange={(open) => {
          if (!open && !isUpdatingAnswer) {
            setDeletingAnswerId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus pesan?</AlertDialogTitle>
            <AlertDialogDescription>
              Pesan ini akan dihapus permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingAnswer}>
              Batal
            </AlertDialogCancel>
            <Button
              disabled={isUpdatingAnswer}
              onClick={confirmDeleteAnswer}
              type="button"
              variant="destructive"
            >
              {isUpdatingAnswer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Pesan"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
