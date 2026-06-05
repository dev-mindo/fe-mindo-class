import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, CircleDashed } from "lucide-react";
import Link from "next/link";
import { DiscussionPanel } from "./DiscussionPanel";
import { EvaluationDetailPanel } from "./EvaluationDetailPanel";
import { QuizDetailPanel } from "./QuizDetailPanel";
import type {
  DiscussionOrder,
  DiscussionStatusFilter,
  ModuleParticipantFilter,
  ModuleParticipantProgress,
  ModuleProgressItem,
  SelectedEvaluationDetail,
  SelectedQuizDetail,
} from "./types";
import {
  getStatusLabel,
  getTaskStatusLabel,
  isDiscussionModule,
  isEvaluationModule,
  isQuizModule,
  isTaskModule,
} from "./utils";

type Props = {
  selectedModuleProgress?: ModuleProgressItem;
  selectedQuizDetail: SelectedQuizDetail | null;
  setSelectedQuizDetail: (detail: SelectedQuizDetail | null) => void;
  selectedEvaluationDetail: SelectedEvaluationDetail | null;
  setSelectedEvaluationDetail: (detail: SelectedEvaluationDetail | null) => void;
  selectedDiscussionDetail: TDetailDiscussion | null;
  setSelectedDiscussionDetail: (detail: TDetailDiscussion | null) => void;
  moduleDiscussions: Record<number, TModuleDiscussion>;
  isLoadingQuizDetail: boolean;
  isLoadingEvaluationDetail: boolean;
  isLoadingDiscussion: boolean;
  isLoadingDiscussionDetail: boolean;
  moduleParticipantFilter: ModuleParticipantFilter;
  setModuleParticipantFilter: (filter: ModuleParticipantFilter) => void;
  filteredModuleParticipants: ModuleParticipantProgress[];
  paginatedModuleParticipants: ModuleParticipantProgress[];
  moduleParticipantPage: number;
  moduleParticipantTotalPage: number;
  moduleParticipantPaginationPages: number[];
  setModuleParticipantPage: (page: number | ((page: number) => number)) => void;
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
  handleShowQuizDetail: (params: {
    userId: number;
    name: string;
    moduleId: number;
    moduleTitle: string;
  }) => void;
  handleShowEvaluationDetail: (params: {
    userId: number;
    name: string;
    moduleId: number;
    moduleTitle: string;
  }) => void;
  handleShowDiscussionDetail: (discussionId: number) => void;
};

export const ModuleParticipantPanel = ({
  selectedModuleProgress,
  selectedQuizDetail,
  setSelectedQuizDetail,
  selectedEvaluationDetail,
  setSelectedEvaluationDetail,
  selectedDiscussionDetail,
  setSelectedDiscussionDetail,
  moduleDiscussions,
  isLoadingQuizDetail,
  isLoadingEvaluationDetail,
  isLoadingDiscussion,
  isLoadingDiscussionDetail,
  moduleParticipantFilter,
  setModuleParticipantFilter,
  filteredModuleParticipants,
  paginatedModuleParticipants,
  moduleParticipantPage,
  moduleParticipantTotalPage,
  moduleParticipantPaginationPages,
  setModuleParticipantPage,
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
  handleShowQuizDetail,
  handleShowEvaluationDetail,
  handleShowDiscussionDetail,
}: Props) => {
  if (!selectedModuleProgress) {
    return (
      <Card className="self-start overflow-hidden xl:sticky xl:top-4">
        <div className="flex items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div>
            <h2 className="font-semibold">Pilih Module</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Klik salah satu module untuk melihat progress peserta.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="self-start overflow-hidden xl:sticky xl:top-4">
      <div
        className={`flex flex-col ${
          selectedQuizDetail || selectedEvaluationDetail
            ? "max-h-[calc(100vh-96px)]"
            : "max-h-[calc(100vh-180px)]"
        }`}
      >
        {!isDiscussionModule(selectedModuleProgress.type) ? (
          <>
            <CardHeader className="shrink-0 border-b p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-sm">
                    {selectedModuleProgress.title}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedModuleProgress.completedParticipant} dari{" "}
                    {selectedModuleProgress.participants.length} peserta{" "}
                    {isEvaluationModule(selectedModuleProgress.type)
                      ? "sudah mengerjakan"
                      : "sudah mengakses"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  <Badge variant="secondary">
                    {selectedModuleProgress.type}
                  </Badge>
                  <Badge variant="outline">
                    Step{" "}
                    {selectedModuleProgress.step === Number.MAX_SAFE_INTEGER
                      ? "-"
                      : selectedModuleProgress.step}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  {(["all", "DONE", "NOT_TAKEN"] as ModuleParticipantFilter[]).map(
                    (filter) => (
                      <Button
                        key={filter}
                        type="button"
                        size="sm"
                        variant={
                          moduleParticipantFilter === filter
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setModuleParticipantFilter(filter)}
                      >
                        {filter === "all"
                          ? "Semua"
                          : filter === "DONE"
                            ? "Sudah"
                            : "Belum"}
                      </Button>
                    ),
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredModuleParticipants.length} peserta
                </p>
              </div>
            </CardHeader>

            <CardContent className="min-h-0 space-y-2 overflow-y-auto p-3">
              {paginatedModuleParticipants.map((participant) => {
                const isDone = participant.status === "DONE";
                const isEvaluation = isEvaluationModule(
                  selectedModuleProgress.type,
                );
                const isTask = isTaskModule(selectedModuleProgress.type);
                const isLoadingEvaluationStatus =
                  isEvaluation && isLoadingEvaluationDetail;
                const statusLabel = isEvaluation
                  ? isDone
                    ? "Sudah mengerjakan"
                    : "Belum mengerjakan"
                  : isTask
                    ? getTaskStatusLabel(participant.task?.status)
                    : getStatusLabel(participant.status);

                return (
                  <div
                    key={participant.userId}
                    className="flex min-h-11 items-start justify-between gap-3 rounded-md border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {participant.name}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <p className="text-xs text-muted-foreground">
                          {participant.type}
                        </p>
                        {isQuizModule(selectedModuleProgress.type) ? (
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            Nilai terbaru: {participant.score ?? "-"}
                          </Badge>
                        ) : null}
                        {isEvaluationModule(selectedModuleProgress.type) ? (
                          <Badge
                            variant="outline"
                            className="h-5 px-1.5 text-[10px]"
                          >
                            Evaluasi
                          </Badge>
                        ) : null}
                        {isTask ? (
                          <>
                            {participant.task?.uploadUrl ? (
                              <Link
                                href={participant.task.uploadUrl}
                                target="_blank"
                                className="max-w-56 truncate text-xs text-primary underline-offset-2 hover:underline"
                              >
                                {participant.task.uploadUrl}
                              </Link>
                            ) : (
                              <Badge
                                variant="outline"
                                className="h-5 px-1.5 text-[10px]"
                              >
                                Upload: -
                              </Badge>
                            )}
                            <Badge
                              variant="outline"
                              className="h-5 px-1.5 text-[10px]"
                            >
                              Nilai: {participant.task?.grade ?? "-"}
                            </Badge>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {isQuizModule(selectedModuleProgress.type) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isLoadingQuizDetail}
                          onClick={() =>
                            handleShowQuizDetail({
                              userId: participant.userId,
                              name: participant.name,
                              moduleId: selectedModuleProgress.moduleId,
                              moduleTitle: selectedModuleProgress.title,
                            })
                          }
                        >
                          Detail
                        </Button>
                      ) : null}
                      {isEvaluationModule(selectedModuleProgress.type) ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isLoadingEvaluationDetail}
                          onClick={() =>
                            handleShowEvaluationDetail({
                              userId: participant.userId,
                              name: participant.name,
                              moduleId: selectedModuleProgress.moduleId,
                              moduleTitle: selectedModuleProgress.title,
                            })
                          }
                        >
                          Detail
                        </Button>
                      ) : null}
                      <Badge
                        variant={isDone ? "default" : "secondary"}
                        className="h-6 gap-1 px-2"
                      >
                        {isLoadingEvaluationStatus ? (
                          <CircleDashed className="h-3 w-3" />
                        ) : isDone ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <CircleDashed className="h-3 w-3" />
                        )}
                        <span className="text-[11px]">
                          {isLoadingEvaluationStatus
                            ? "Memuat status"
                            : statusLabel}
                        </span>
                      </Badge>
                    </div>
                  </div>
                );
              })}
              {paginatedModuleParticipants.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Peserta tidak ditemukan pada filter ini.
                </div>
              ) : null}
            </CardContent>

            <div className="flex shrink-0 flex-col gap-2 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Halaman {moduleParticipantPage} dari{" "}
                {moduleParticipantTotalPage}
              </p>
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={moduleParticipantPage === 1}
                  onClick={() => setModuleParticipantPage((page) => page - 1)}
                >
                  Previous
                </Button>
                {moduleParticipantPaginationPages.map((page) => (
                  <Button
                    key={page}
                    type="button"
                    size="sm"
                    variant={
                      page === moduleParticipantPage ? "default" : "outline"
                    }
                    onClick={() => setModuleParticipantPage(page)}
                  >
                    {page}
                  </Button>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={moduleParticipantPage === moduleParticipantTotalPage}
                  onClick={() => setModuleParticipantPage((page) => page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>

            {isQuizModule(selectedModuleProgress.type) ? (
              <QuizDetailPanel
                selectedQuizDetail={selectedQuizDetail}
                setSelectedQuizDetail={setSelectedQuizDetail}
              />
            ) : null}
            {isEvaluationModule(selectedModuleProgress.type) ? (
              <EvaluationDetailPanel
                selectedEvaluationDetail={selectedEvaluationDetail}
                setSelectedEvaluationDetail={setSelectedEvaluationDetail}
              />
            ) : null}
          </>
        ) : (
          <DiscussionPanel
            moduleId={selectedModuleProgress.moduleId}
            moduleDiscussions={moduleDiscussions}
            selectedDiscussionDetail={selectedDiscussionDetail}
            setSelectedDiscussionDetail={setSelectedDiscussionDetail}
            isLoadingDiscussion={isLoadingDiscussion}
            isLoadingDiscussionDetail={isLoadingDiscussionDetail}
            discussionStatusFilter={discussionStatusFilter}
            setDiscussionStatusFilter={setDiscussionStatusFilter}
            discussionOrder={discussionOrder}
            setDiscussionOrder={setDiscussionOrder}
            paginatedDiscussions={paginatedDiscussions}
            filteredDiscussions={filteredDiscussions}
            discussionPage={discussionPage}
            discussionTotalPage={discussionTotalPage}
            discussionPaginationPages={discussionPaginationPages}
            setDiscussionPage={setDiscussionPage}
            handleShowDiscussionDetail={handleShowDiscussionDetail}
          />
        )}
      </div>
    </Card>
  );
};
