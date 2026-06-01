import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare } from "lucide-react";
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
  return (
    <div className="shrink-0 border-t p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Diskusi</h3>
          <p className="text-xs text-muted-foreground">
            Daftar diskusi pada module ini.
          </p>
        </div>
        <Badge variant="secondary">
          {moduleDiscussions[moduleId]?.length ?? 0} diskusi
        </Badge>
      </div>

      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {(["all", "open", "close"] as DiscussionStatusFilter[]).map(
            (filter) => (
              <Button
                key={filter}
                type="button"
                size="sm"
                variant={discussionStatusFilter === filter ? "default" : "outline"}
                onClick={() => setDiscussionStatusFilter(filter)}
              >
                {filter === "all" ? "Semua" : filter === "open" ? "Open" : "Close"}
              </Button>
            ),
          )}
        </div>
        <Select
          value={discussionOrder}
          onValueChange={(value) => setDiscussionOrder(value as DiscussionOrder)}
        >
          <SelectTrigger className="h-9 lg:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Terbaru</SelectItem>
            <SelectItem value="asc">Terlama</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoadingDiscussion ? (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Memuat diskusi...
        </div>
      ) : paginatedDiscussions.length ? (
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {paginatedDiscussions.map((discussion) => (
            <div key={discussion.id} className="rounded-lg border bg-card p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold">
                    {discussion.title}
                  </h4>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={discussion.status ? "default" : "destructive"}
                    >
                      {discussion.status ? "open" : "close"}
                    </Badge>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <MessageSquare className="mr-1 h-3.5 w-3.5" />
                      {discussion._count.discussionAnswer}
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoadingDiscussionDetail}
                  onClick={() => handleShowDiscussionDetail(discussion.id)}
                >
                  Detail
                </Button>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-green-500">
                    {discussion.user.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(discussion.createdAt)}
                  </p>
                </div>
                <p className="line-clamp-3 text-sm">{discussion.question}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
          Diskusi tidak ditemukan pada filter ini.
        </div>
      )}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
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

      {selectedDiscussionDetail ? (
        <div className="mt-4 rounded-lg border bg-card p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="truncate text-sm font-semibold">
                {selectedDiscussionDetail.title}
              </h4>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  variant={
                    selectedDiscussionDetail.status ? "default" : "destructive"
                  }
                >
                  {selectedDiscussionDetail.status ? "open" : "close"}
                </Badge>
                <div className="flex items-center text-xs text-muted-foreground">
                  <MessageSquare className="mr-1 h-3.5 w-3.5" />
                  {selectedDiscussionDetail._count.discussionAnswer}
                </div>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedDiscussionDetail(null)}
            >
              Close
            </Button>
          </div>

          <div className="max-h-[460px] space-y-3 overflow-y-auto rounded-md bg-muted/40 p-3">
            <div className="flex justify-start">
              <div className="max-w-[86%] rounded-lg rounded-tl-sm bg-background p-3 shadow-sm">
                <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-semibold text-green-500">
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
              selectedDiscussionDetail.discussionAnswer.map((answer) => (
                <div key={answer.id} className="flex justify-end">
                  <div className="max-w-[86%] rounded-lg rounded-tr-sm bg-primary p-3 text-primary-foreground shadow-sm">
                    <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-semibold">
                        {answer.user.name}
                      </p>
                      <p className="text-[11px] text-primary-foreground/80">
                        {formatDateTime(answer.createdAt)}
                      </p>
                    </div>
                    <p className="whitespace-pre-wrap text-sm">
                      {answer.message}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                Belum ada jawaban pada diskusi ini.
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
