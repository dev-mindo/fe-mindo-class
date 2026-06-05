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
  task?: {
    uploadUrl?: string | null;
    grade?: number | string | null;
    status?: string | null;
  };
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

export type EvaluationQuestion = {
  evaluationId: number;
  name: string;
  position: number;
  title: string;
  required: boolean;
  value: string | null;
  type: string;
};

export type EvaluationAnswer = {
  feedbackUserId: number;
  name: string;
  evaluationId: number;
  answer: string;
};

export type EvaluationFeedbackUser = {
  id: number;
  evaluationId: number;
  userId: number;
  productId: number;
  done: boolean;
  userClass?: {
    name: string;
  };
  feedbackAnswer: EvaluationAnswer[];
};

export type ModuleEvaluation = {
  id: number;
  moduleId: number;
  linkUrl: string | null;
  feedbackQuestion: EvaluationQuestion[];
  feedbackUser: EvaluationFeedbackUser[];
};

export type SelectedEvaluationDetail = {
  userId: number;
  name: string;
  moduleId: number;
  moduleTitle: string;
  evaluation?: ModuleEvaluation;
  feedbackUser?: EvaluationFeedbackUser;
};
