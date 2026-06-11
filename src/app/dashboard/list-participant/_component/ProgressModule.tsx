import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useEffect, useMemo, useState } from "react";
import { ModuleList } from "./progress-module/ModuleList";
import { ModuleParticipantPanel } from "./progress-module/ModuleParticipantPanel";
import { ProgressViewSelect } from "./progress-module/ProgressViewSelect";
import { UserProgressView } from "./progress-module/UserProgressView";
import type {
  DiscussionOrder,
  DiscussionStatusFilter,
  ModuleEvaluation,
  ModuleParticipantFilter,
  ModuleProgressItem,
  SelectedEvaluationDetail,
  SelectedQuizDetail,
  ViewMode,
} from "./progress-module/types";
import {
  DISCUSSION_PAGE_SIZE,
  PARTICIPANT_PAGE_SIZE,
  getPaginationPages,
  isDiscussionModule,
  isEvaluationModule,
  isTaskModule,
} from "./progress-module/utils";

type Props = {
  selectedClass: string | null;
  selectedSetion: number | null;
  viewMode?: ViewMode;
  onViewModeChange?: (viewMode: ViewMode) => void;
};

export const ProgressParticipantComponent = ({
  selectedClass,
  selectedSetion,
  viewMode: controlledViewMode,
  onViewModeChange,
}: Props) => {
  const [dataProgress, setDataProgress] = useState<TDTModuleProgress[]>([]);
  const [dataModule, setDataModule] = useState<TListModuleBySection[]>([]);
  const [dataScoreParticipant, setDataScoreParticipant] = useState<
    TScoreList[]
  >([]);
  const [dataTaskParticipant, setDataTaskParticipant] = useState<
    TModuleTypeGrade[]
  >([]);
  const [internalViewMode, setInternalViewMode] =
    useState<ViewMode>("module");
  const viewMode = controlledViewMode ?? internalViewMode;
  const setViewMode = onViewModeChange ?? setInternalViewMode;
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedQuizDetail, setSelectedQuizDetail] =
    useState<SelectedQuizDetail | null>(null);
  const [selectedEvaluationDetail, setSelectedEvaluationDetail] =
    useState<SelectedEvaluationDetail | null>(null);
  const [selectedDiscussionDetail, setSelectedDiscussionDetail] =
    useState<TDetailDiscussion | null>(null);
  const [isLoadingQuizDetail, setIsLoadingQuizDetail] = useState(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState(false);
  const [isLoadingEvaluationDetail, setIsLoadingEvaluationDetail] =
    useState(false);
  const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(false);
  const [isLoadingDiscussionDetail, setIsLoadingDiscussionDetail] =
    useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);
  const [moduleDiscussions, setModuleDiscussions] = useState<
    Record<number, TModuleDiscussion>
  >({});
  const [moduleEvaluations, setModuleEvaluations] = useState<
    Record<number, ModuleEvaluation | null>
  >({});
  const [moduleParticipantFilter, setModuleParticipantFilter] =
    useState<ModuleParticipantFilter>("all");
  const [moduleParticipantPage, setModuleParticipantPage] = useState(1);
  const [discussionStatusFilter, setDiscussionStatusFilter] =
    useState<DiscussionStatusFilter>("all");
  const [discussionOrder, setDiscussionOrder] =
    useState<DiscussionOrder>("desc");
  const [discussionPage, setDiscussionPage] = useState(1);

  const fetchProgressByClassModule = async () => {
    if (!selectedClass || !selectedSetion) {
      setDataProgress([]);
      return;
    }

    const progress: ApiResponse<TDTModuleProgress[]> = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}/module/${selectedSetion}`,
    );

    setDataProgress(progress.data || []);
  };

  const fetchModuleBySectionId = async () => {
    if (!selectedSetion) {
      setDataModule([]);
      return;
    }

    const modules: ApiResponse<TListModuleBySection[]> = await fetchApi(
      `/admin/module/get-by-section/${selectedSetion}`,
    );

    setDataModule(modules.data || []);
  };

  const fetchScoresByClassModule = async () => {
    if (!selectedClass || !selectedSetion) {
      setDataScoreParticipant([]);
      return;
    }

    const scores: ApiResponse<TScoreList[]> = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}/participant-score/${selectedSetion}`,
    );

    setDataScoreParticipant(scores.data || []);
  };

  const fetchTaskByClassModule = async () => {
    if (!selectedClass || !selectedSetion) {
      setDataTaskParticipant([]);
      return;
    }

    const tasks: ApiResponse<TModuleTypeGrade[]> = await fetchApi(
      `/admin/classroom/show-list-participant/${selectedClass}/module-type/${selectedSetion}/type/TASK`,
    );

    setDataTaskParticipant(tasks.data || []);
  };

  useEffect(() => {
    setSelectedModuleId(null);
    fetchProgressByClassModule();
    fetchModuleBySectionId();
    fetchScoresByClassModule();
    fetchTaskByClassModule();
  }, [selectedClass, selectedSetion]);

  const moduleTitleById = useMemo(() => {
    return dataModule.reduce<Record<number, string>>((acc, moduleItem) => {
      acc[moduleItem.id] = moduleItem.title;
      return acc;
    }, {});
  }, [dataModule]);

  const moduleStepById = useMemo(() => {
    return dataModule.reduce<Record<number, number>>((acc, moduleItem) => {
      acc[moduleItem.id] = moduleItem.step;
      return acc;
    }, {});
  }, [dataModule]);

  const moduleTypeById = useMemo(() => {
    return dataModule.reduce<Record<number, string>>((acc, moduleItem) => {
      acc[moduleItem.id] = moduleItem.type;
      return acc;
    }, {});
  }, [dataModule]);

  const scoreByUserModule = useMemo(() => {
    return dataScoreParticipant.reduce<Record<string, number>>(
      (acc, participant) => {
        participant.modules.forEach((moduleItem) => {
          acc[`${participant.userId}-${moduleItem.moduleId}`] =
            moduleItem.score;
        });

        return acc;
      },
      {},
    );
  }, [dataScoreParticipant]);

  const taskByUserModule = useMemo(() => {
    return dataTaskParticipant.reduce<
      Record<
        string,
        {
          id?: number | null;
          taskId?: number;
          uploadUrl?: string | null;
          grade?: number | string | null;
          status?: string | null;
        }
      >
    >((acc, taskModule) => {
      const moduleId =
        taskModule.moduleId ??
        dataModule.find((moduleItem) => moduleItem.title === taskModule.moduleTitle)
          ?.id;

      if (!moduleId) {
        return acc;
      }

      taskModule.data.forEach((participant) => {
        const participantModuleId = participant.moduleId ?? moduleId;
        acc[`${participant.userId}-${participantModuleId}`] = {
          id: participant.id,
          taskId: participant.taskId,
          uploadUrl: participant.uploadUrl,
          grade: participant.grade,
          status: participant.status,
        };
      });

      return acc;
    }, {});
  }, [dataModule, dataTaskParticipant]);

  const progressByModule = useMemo<ModuleProgressItem[]>(() => {
    const moduleIds = new Set<number>();

    dataModule.forEach((moduleItem) => moduleIds.add(moduleItem.id));
    dataProgress.forEach((participant) => {
      participant.moduleProgress.forEach((progressItem) => {
        moduleIds.add(progressItem.moduleId);
      });
    });

    return Array.from(moduleIds)
      .map((moduleId) => {
        const participants = dataProgress.map((participant) => {
          const progressItem = participant.moduleProgress.find(
            (item) => item.moduleId === moduleId,
          );

          return {
            userId: participant.userId,
            name: participant.name,
            type: progressItem?.type ?? moduleTypeById[moduleId] ?? "-",
            status: progressItem?.status ?? "NOT_TAKEN",
            score: scoreByUserModule[`${participant.userId}-${moduleId}`],
            task: isTaskModule(moduleTypeById[moduleId] ?? progressItem?.type)
              ? taskByUserModule[`${participant.userId}-${moduleId}`]
              : undefined,
          };
        });

        return {
          moduleId,
          step: moduleStepById[moduleId] ?? Number.MAX_SAFE_INTEGER,
          title: moduleTitleById[moduleId] ?? `Modul ${moduleId}`,
          type: moduleTypeById[moduleId] ?? participants[0]?.type ?? "-",
          participants,
          completedParticipant: participants.filter(
            (participant) => participant.status === "DONE",
          ).length,
        };
      })
      .sort((currentModule, nextModule) => {
        if (currentModule.step !== nextModule.step) {
          return currentModule.step - nextModule.step;
        }

        return currentModule.moduleId - nextModule.moduleId;
      });
  }, [
    dataModule,
    dataProgress,
    moduleStepById,
    moduleTitleById,
    moduleTypeById,
    scoreByUserModule,
    taskByUserModule,
  ]);

  const selectedModuleProgress =
    progressByModule.find(
      (moduleItem) => moduleItem.moduleId === selectedModuleId,
    ) ?? progressByModule[0];

  const selectedModuleEvaluation = selectedModuleProgress
    ? moduleEvaluations[selectedModuleProgress.moduleId]
    : undefined;

  const selectedModuleProgressWithEvaluation = useMemo(() => {
    if (!selectedModuleProgress) return undefined;

    if (!isEvaluationModule(selectedModuleProgress.type)) {
      return selectedModuleProgress;
    }

    const participants = selectedModuleProgress.participants.map(
      (participant) => {
        const feedbackUser = selectedModuleEvaluation?.feedbackUser.find(
          (feedback) => feedback.userId === participant.userId,
        );

        return {
          ...participant,
          status: feedbackUser?.done ? "DONE" : "NOT_TAKEN",
        };
      },
    );

    return {
      ...selectedModuleProgress,
      participants,
      completedParticipant: participants.filter(
        (participant) => participant.status === "DONE",
      ).length,
    };
  }, [selectedModuleEvaluation, selectedModuleProgress]);

  const filteredModuleParticipants =
    selectedModuleProgressWithEvaluation?.participants.filter((participant) => {
      if (moduleParticipantFilter === "all") return true;
      return participant.status === moduleParticipantFilter;
    }) ?? [];
  const moduleParticipantTotalPage = Math.max(
    1,
    Math.ceil(filteredModuleParticipants.length / PARTICIPANT_PAGE_SIZE),
  );
  const paginatedModuleParticipants = filteredModuleParticipants.slice(
    (moduleParticipantPage - 1) * PARTICIPANT_PAGE_SIZE,
    moduleParticipantPage * PARTICIPANT_PAGE_SIZE,
  );
  const moduleParticipantPaginationPages = getPaginationPages(
    moduleParticipantPage,
    moduleParticipantTotalPage,
  );

  const currentModuleDiscussions = selectedModuleProgress
    ? (moduleDiscussions[selectedModuleProgress.moduleId] ?? [])
    : [];
  const filteredDiscussions = currentModuleDiscussions
    .filter((discussion) => {
      if (discussionStatusFilter === "all") return true;
      return discussionStatusFilter === "open"
        ? discussion.status
        : !discussion.status;
    })
    .sort((currentDiscussion, nextDiscussion) => {
      const currentTime = new Date(currentDiscussion.createdAt).getTime();
      const nextTime = new Date(nextDiscussion.createdAt).getTime();

      return discussionOrder === "desc"
        ? nextTime - currentTime
        : currentTime - nextTime;
    });
  const discussionTotalPage = Math.max(
    1,
    Math.ceil(filteredDiscussions.length / DISCUSSION_PAGE_SIZE),
  );
  const paginatedDiscussions = filteredDiscussions.slice(
    (discussionPage - 1) * DISCUSSION_PAGE_SIZE,
    discussionPage * DISCUSSION_PAGE_SIZE,
  );
  const discussionPaginationPages = getPaginationPages(
    discussionPage,
    discussionTotalPage,
  );

  useEffect(() => {
    if (!progressByModule.length) {
      setSelectedModuleId(null);
      return;
    }

    const hasSelectedModule = progressByModule.some(
      (moduleItem) => moduleItem.moduleId === selectedModuleId,
    );

    if (!hasSelectedModule) {
      setSelectedModuleId(progressByModule[0].moduleId);
    }
  }, [progressByModule, selectedModuleId]);

  useEffect(() => {
    setSelectedQuizDetail(null);
    setSelectedEvaluationDetail(null);
    setSelectedDiscussionDetail(null);
    setModuleParticipantFilter("all");
    setModuleParticipantPage(1);
    setDiscussionStatusFilter("all");
    setDiscussionOrder("desc");
    setDiscussionPage(1);
  }, [selectedModuleId, selectedSetion, viewMode]);

  useEffect(() => {
    const evaluationModules = progressByModule.filter(
      (moduleItem) =>
        isEvaluationModule(moduleItem.type) &&
        !(moduleItem.moduleId in moduleEvaluations),
    );

    if (!evaluationModules.length) return;

    const fetchEvaluationByModule = async () => {
      setIsLoadingEvaluation(true);

      try {
        const evaluationResponses = await Promise.all(
          evaluationModules.map(async (moduleItem) => {
            const evaluation: ApiResponse<ModuleEvaluation> = await fetchApi(
              `/admin/evaluation/module/${moduleItem.moduleId}`,
            );

            return {
              moduleId: moduleItem.moduleId,
              evaluation: evaluation.data ?? null,
            };
          }),
        );

        setModuleEvaluations((current) => {
          const nextEvaluations = { ...current };

          evaluationResponses.forEach((response) => {
            nextEvaluations[response.moduleId] = response.evaluation;
          });

          return nextEvaluations;
        });
      } finally {
        setIsLoadingEvaluation(false);
      }
    };

    fetchEvaluationByModule();
  }, [moduleEvaluations, progressByModule]);

  useEffect(() => {
    const discussionModules = progressByModule.filter(
      (moduleItem) =>
        isDiscussionModule(moduleItem.type) &&
        !moduleDiscussions[moduleItem.moduleId],
    );

    if (!discussionModules.length) return;

    const fetchDiscussionByModule = async () => {
      setIsLoadingDiscussion(true);

      try {
        const discussionResponses = await Promise.all(
          discussionModules.map(async (moduleItem) => {
            const discussion: ApiResponse<TModuleDiscussion> = await fetchApi(
              `/admin/discussion/show-by-module/${moduleItem.moduleId}`,
            );

            return {
              moduleId: moduleItem.moduleId,
              discussions: discussion.data ?? [],
            };
          }),
        );

        setModuleDiscussions((current) => {
          const nextDiscussions = { ...current };

          discussionResponses.forEach((response) => {
            nextDiscussions[response.moduleId] = response.discussions;
          });

          return nextDiscussions;
        });
      } finally {
        setIsLoadingDiscussion(false);
      }
    };

    fetchDiscussionByModule();
  }, [moduleDiscussions, progressByModule]);

  useEffect(() => {
    setModuleParticipantPage(1);
  }, [moduleParticipantFilter]);

  useEffect(() => {
    if (moduleParticipantPage > moduleParticipantTotalPage) {
      setModuleParticipantPage(moduleParticipantTotalPage);
    }
  }, [moduleParticipantPage, moduleParticipantTotalPage]);

  useEffect(() => {
    setDiscussionPage(1);
  }, [discussionStatusFilter, discussionOrder]);

  useEffect(() => {
    if (discussionPage > discussionTotalPage) {
      setDiscussionPage(discussionTotalPage);
    }
  }, [discussionPage, discussionTotalPage]);

  const handleShowQuizDetail = async ({
    userId,
    name,
    moduleId,
    moduleTitle,
  }: {
    userId: number;
    name: string;
    moduleId: number;
    moduleTitle: string;
  }) => {
    if (!selectedClass) return;

    setIsLoadingQuizDetail(true);

    try {
      const detailParticipant: ApiResponse<TDetailParticipant> = await fetchApi(
        `/admin/classroom/show-detail-participant/${selectedClass}/${userId}`,
      );

      const moduleDetail = detailParticipant.data?.sections
        .flatMap((section) => section.modules)
        .find((moduleItem) => moduleItem.moduleId === moduleId);

      setSelectedQuizDetail({
        userId,
        name,
        moduleId,
        moduleTitle,
        attempts: moduleDetail?.quizAttempts ?? [],
      });
    } finally {
      setIsLoadingQuizDetail(false);
    }
  };

  const handleShowEvaluationDetail = async ({
    userId,
    name,
    moduleId,
    moduleTitle,
  }: {
    userId: number;
    name: string;
    moduleId: number;
    moduleTitle: string;
  }) => {
    setIsLoadingEvaluationDetail(true);

    try {
      const evaluation = moduleEvaluations[moduleId];
      const feedbackUser = evaluation?.feedbackUser.find(
        (feedback) => feedback.userId === userId,
      );

      setSelectedEvaluationDetail({
        userId,
        name,
        moduleId,
        moduleTitle,
        evaluation: evaluation ?? undefined,
        feedbackUser,
      });
    } finally {
      setIsLoadingEvaluationDetail(false);
    }
  };

  const handleShowDiscussionDetail = async (discussionId: number) => {
    setIsLoadingDiscussionDetail(true);

    try {
      const detailDiscussion: ApiResponse<TDetailDiscussion> = await fetchApi(
        `/admin/discussion/detail/${discussionId}`,
      );

      setSelectedDiscussionDetail(detailDiscussion.data ?? null);
    } finally {
      setIsLoadingDiscussionDetail(false);
    }
  };

  const handleUpdateTaskScore = async (taskId: number, score: number) => {
    setUpdatingTaskId(taskId);

    try {
      const response: ApiResponse = await fetchApi(
        `/admin/task/${taskId}/score`,
        {
          method: "PATCH",
          body: { score },
        },
      );

      if (response.success) {
        await fetchTaskByClassModule();
      }

      return response;
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (!selectedClass || !selectedSetion) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Pilih kelas dan section untuk melihat progres modul peserta.
      </div>
    );
  }

  if (dataProgress.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        Belum ada data progres modul pada section ini.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {controlledViewMode === undefined ? (
        <ProgressViewSelect viewMode={viewMode} setViewMode={setViewMode} />
      ) : null}

      {viewMode === "module" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.45fr)_minmax(520px,1.55fr)]">
          <ModuleList
            progressByModule={progressByModule}
            selectedModuleProgress={selectedModuleProgress}
            moduleDiscussions={moduleDiscussions}
            setSelectedModuleId={setSelectedModuleId}
          />
          <ModuleParticipantPanel
            selectedModuleProgress={selectedModuleProgressWithEvaluation}
            selectedQuizDetail={selectedQuizDetail}
            setSelectedQuizDetail={setSelectedQuizDetail}
            selectedEvaluationDetail={selectedEvaluationDetail}
            setSelectedEvaluationDetail={setSelectedEvaluationDetail}
            selectedDiscussionDetail={selectedDiscussionDetail}
            setSelectedDiscussionDetail={setSelectedDiscussionDetail}
            moduleDiscussions={moduleDiscussions}
            isLoadingQuizDetail={isLoadingQuizDetail}
            isLoadingEvaluationDetail={
              isLoadingEvaluation || isLoadingEvaluationDetail
            }
            isLoadingDiscussion={isLoadingDiscussion}
            isLoadingDiscussionDetail={isLoadingDiscussionDetail}
            updatingTaskId={updatingTaskId}
            moduleParticipantFilter={moduleParticipantFilter}
            setModuleParticipantFilter={setModuleParticipantFilter}
            filteredModuleParticipants={filteredModuleParticipants}
            paginatedModuleParticipants={paginatedModuleParticipants}
            moduleParticipantPage={moduleParticipantPage}
            moduleParticipantTotalPage={moduleParticipantTotalPage}
            moduleParticipantPaginationPages={moduleParticipantPaginationPages}
            setModuleParticipantPage={setModuleParticipantPage}
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
            handleShowQuizDetail={handleShowQuizDetail}
            handleShowEvaluationDetail={handleShowEvaluationDetail}
            handleShowDiscussionDetail={handleShowDiscussionDetail}
            handleUpdateTaskScore={handleUpdateTaskScore}
          />
        </div>
      ) : (
        <UserProgressView
          dataProgress={dataProgress}
          moduleTitleById={moduleTitleById}
        />
      )}
    </div>
  );
};
