import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
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
}: Props) => {
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
    <div className="h-[calc(100vh-180px)] min-h-[560px] border-t">
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

        <div className="flex min-h-0 flex-col bg-muted/30">
          {selectedDiscussionDetail ? (
            <>
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
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setSelectedDiscussionDetail(null)}
                    aria-label="Tutup detail diskusi"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                    const isQuestionOwner =
                      answer.userId === selectedDiscussionDetail.userId;
                    const answerVotes =
                      answer.voteSummary ??
                      getVoteSummary(answer.discussionVote);

                    return (
                      <div
                        key={answer.id}
                        className={`flex items-end gap-2 ${
                          isQuestionOwner ? "justify-start" : "justify-end"
                        }`}
                      >
                        {isQuestionOwner ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-[11px] font-semibold text-muted-foreground shadow-sm">
                            {getInitials(answer.user.name)}
                          </div>
                        ) : null}
                        <div
                          className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm ${
                            isQuestionOwner
                              ? "rounded-bl-sm bg-background"
                              : "rounded-br-sm bg-primary text-primary-foreground"
                          }`}
                        >
                          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p
                              className={`text-xs font-semibold ${
                                isQuestionOwner ? "text-primary" : ""
                              }`}
                            >
                              {answer.user.name}
                            </p>
                            <p
                              className={`text-[11px] ${
                                isQuestionOwner
                                  ? "text-muted-foreground"
                                  : "text-primary-foreground/75"
                              }`}
                            >
                              {formatDateTime(answer.createdAt)}
                            </p>
                          </div>
                          <p className="whitespace-pre-wrap text-sm">
                            {answer.message}
                          </p>
                          <div
                            className={`mt-2 flex items-center gap-3 text-[11px] ${
                              isQuestionOwner
                                ? "text-muted-foreground"
                                : "text-primary-foreground/75"
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
                        {!isQuestionOwner ? (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-sm">
                            {getInitials(answer.user.name)}
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
    </div>
  );
};
