import { ApiResponse, fetchApi } from "@/lib/utils/fetchApi";
import { useEffect, useMemo, useState } from "react";
import { ModuleList } from "./progress-module/ModuleList";
import { ModuleParticipantPanel } from "./progress-module/ModuleParticipantPanel";
import { ProgressViewSelect } from "./progress-module/ProgressViewSelect";
import { UserProgressView } from "./progress-module/UserProgressView";
import type {
  DiscussionOrder,
  DiscussionStatusFilter,
  ModuleParticipantFilter,
  ModuleProgressItem,
  SelectedQuizDetail,
  ViewMode,
} from "./progress-module/types";
import {
  DISCUSSION_PAGE_SIZE,
  PARTICIPANT_PAGE_SIZE,
  getPaginationPages,
  isDiscussionModule,
} from "./progress-module/utils";

type Props = {
  selectedClass: string | null;
  selectedSetion: number | null;
};

export const ProgressParticipantComponent = ({
  selectedClass,
  selectedSetion,
}: Props) => {
  const [dataProgress, setDataProgress] = useState<TDTModuleProgress[]>([]);
  const [dataModule, setDataModule] = useState<TListModuleBySection[]>([]);
  const [dataScoreParticipant, setDataScoreParticipant] = useState<
    TScoreList[]
  >([]);
  const [viewMode, setViewMode] = useState<ViewMode>("user");
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);
  const [selectedQuizDetail, setSelectedQuizDetail] =
    useState<SelectedQuizDetail | null>(null);
  const [selectedDiscussionDetail, setSelectedDiscussionDetail] =
    useState<TDetailDiscussion | null>(null);
  const [isLoadingQuizDetail, setIsLoadingQuizDetail] = useState(false);
  const [isLoadingDiscussion, setIsLoadingDiscussion] = useState(false);
  const [isLoadingDiscussionDetail, setIsLoadingDiscussionDetail] =
    useState(false);
  const [moduleDiscussions, setModuleDiscussions] = useState<
    Record<number, TModuleDiscussion>
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

  useEffect(() => {
    fetchProgressByClassModule();
    fetchModuleBySectionId();
    fetchScoresByClassModule();
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
  ]);

  const selectedModuleProgress =
    progressByModule.find(
      (moduleItem) => moduleItem.moduleId === selectedModuleId,
    ) ?? progressByModule[0];

  const filteredModuleParticipants =
    selectedModuleProgress?.participants.filter((participant) => {
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
    setSelectedDiscussionDetail(null);
    setModuleParticipantFilter("all");
    setModuleParticipantPage(1);
    setDiscussionStatusFilter("all");
    setDiscussionOrder("desc");
    setDiscussionPage(1);
  }, [selectedModuleId, selectedSetion, viewMode]);

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
      <ProgressViewSelect viewMode={viewMode} setViewMode={setViewMode} />

      {viewMode === "module" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(260px,0.45fr)_minmax(520px,1.55fr)]">
          <ModuleList
            progressByModule={progressByModule}
            selectedModuleProgress={selectedModuleProgress}
            moduleDiscussions={moduleDiscussions}
            setSelectedModuleId={setSelectedModuleId}
          />
          <ModuleParticipantPanel
            selectedModuleProgress={selectedModuleProgress}
            selectedQuizDetail={selectedQuizDetail}
            setSelectedQuizDetail={setSelectedQuizDetail}
            selectedDiscussionDetail={selectedDiscussionDetail}
            setSelectedDiscussionDetail={setSelectedDiscussionDetail}
            moduleDiscussions={moduleDiscussions}
            isLoadingQuizDetail={isLoadingQuizDetail}
            isLoadingDiscussion={isLoadingDiscussion}
            isLoadingDiscussionDetail={isLoadingDiscussionDetail}
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
            handleShowDiscussionDetail={handleShowDiscussionDetail}
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
