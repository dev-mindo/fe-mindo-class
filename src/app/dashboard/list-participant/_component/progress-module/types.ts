export type ViewMode = "user" | "module";
export type ModuleParticipantFilter = "all" | "DONE" | "NOT_TAKEN";
export type DiscussionStatusFilter = "all" | "open" | "close";
export type DiscussionOrder = "desc" | "asc";

export type ModuleParticipantProgress = {
  userId: number;
  name: string;
  type: string;
  status: string;
  score?: number;
};

export type ModuleProgressItem = {
  moduleId: number;
  step: number;
  title: string;
  type: string;
  participants: ModuleParticipantProgress[];
  completedParticipant: number;
};

export type QuizAttemptDetail =
  TDetailParticipant["sections"][number]["modules"][number]["quizAttempts"][number];

export type SelectedQuizDetail = {
  userId: number;
  name: string;
  moduleId: number;
  moduleTitle: string;
  attempts: QuizAttemptDetail[];
};
