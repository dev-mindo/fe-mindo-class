declare global {
  type TQuizAll =
    | {
        id: number;
        title: string;
        limitTrial: number;
        limitTime: string;
        type: string;
        pagination: boolean;
        random: boolean;
        quizAttempt: Array<{
          id: number;
          score: number;
          _count: {
            UserAnswer: number;
          };
          onProcess: boolean;
          signatureQuiz: string;
        }>;
        _count: {
          question: number;
        };
      }
    | undefined;

  type TQuizData = {
    status: string;
    quiz: {
      title: string;
      completed: number;
      totalQuestion: number;
      timeLimit: string;
      eventType: string;
      score?: number;
      totalCorrect?: number;
    };
    pagination: {
      next: number;
      back: number;
      current: number;
      page: Array<{
        number: number;
        current: boolean;
        completed: boolean;
        isCorrect?: boolean;
      }>;
    };
    question: {
      id: number;
      image: string;
      questionText: string;
      userAnswer: Array<any>;
      Answer: Array<{
        id: number;
        answerText: string;
      }>;
    };
  };

  type TModuleMaterial = {
    id: number;
    productId: number;
    title: string;
    type: string;
    description: string;
    videoUrl?: string;
    file?: string;
    userNote?: string;
    evaluation?: {
      id: number;
      feedbackUser: Array<any>;
    };
  };

  type TClassroom = {
    id: number;
    productId: number;
    productType: string;
    publish: boolean;
    publishTime: string;
    thumbnail: string;
    title: string;
    slug: string;
    createdAt: string;
    updatedAt: string;
  };

  type TCreateToken = {
    accessToken: string;
  };

  type TCurrentPage = {
    typeClass: string;
    classSlug: string;
    sectionSlug: string;
    module: {
      slug: string;
      id: number;
    };
    checkCurrentPage: boolean;
  };

  type TNavClass = {
    progress: number;
    totalModules: number;
    sectionMenu: Array<{
      title: string;
      slug: string;
      position: number;
      modules: Array<{
        id: number;
        sectionId: number;
        type: string;
        step: number;
        title: string;
        menuTitle: string;
        slug: string;
        description: string;
        UserModule: Array<{
          productId: number;
          userId: number;
          moduleId: number;
          status: string;
          createdAt: string;
          updatedAt: string;
        }>;
        status: string;
        current: boolean;
      }>;
    }>;
  };

  type TCurrentPageNav =
    | {
        id: number;
        sectionId: number;
        type: string;
        step: number;
        title: string;
        menuTitle: string;
        slug: string;
        description: string;
        UserModule: Array<{
          productId: number;
          userId: number;
          moduleId: number;
          status: string;
          createdAt: string;
          updatedAt: string;
        }>;
        status: string;
        current: boolean;
      }
    | undefined;

  type TFormFeedback = {
    id: number;
    formFeedback: Array<{
      position: number;
      type: string;
      title: string;
      name: string;
      required: boolean;
      value:
        | Array<{
            id: string | number;
            label: string;
          }>
        | undefined;
    }>;
    feetbackUser: Array<{
      id: number;
      evaluationId: number;
      userId: number;
      productId: number;
      done: boolean;
    }>;
  };

  type TEvaluationAttemptQuiz = Array<{
    id: number;
    title: string;
    data: Array<{
      id: number;
      userId: number;
      quizId: number;
      score: number;
      status: string;
      startedAt: string;
      completeAt: string;
      quiz: {
        id: number;
        moduleId: number;
        title: string;
        minimumScore: number;
        limitTime: string;
        limitTrial: number;
        pagination: boolean;
        random: boolean;
        publish: boolean;
        createdAt: string;
        updatedAt: string;
        module: {
          id: number;
          sectionId: number;
          type: string;
          step: number;
          title: string;
          menuTitle: string;
          slug: string;
          description: string;
        };
      };
    }>;
  }>;

  type TDiscussionVote = {
    discussionId: number | null;
    discussionAnswerId: number | null;
    vote: string;
    isUser: boolean;
  };

  type TDiscussionAnswer = {
    id: number;
    userId: number;
    productId: number;
    discussionId: number;
    message: string;
    createdAt: string;
    updatedAt: string;
    user: {
      name: string;
    };
    discussionVote: Array<TDiscussionVote>;
    isUser: boolean;
    voteSummary: {
      up: number;
      down: number;
    };
  };

  type TDetailDiscussion = {
    id: number;
    moduleId: number;
    userId: number;
    productId: number;
    status: boolean;
    title: string;
    question: string;
    createdAt: string;
    updatedAt: string;
    _count: {
      discussionAnswer: number;
    };
    discussionAnswer: Array<TDiscussionAnswer>;
    discussionVote: Array<TDiscussionVote>;
    user: {
      name: string;
    };
    voteSummary: {
      up: number;
      down: number;
    };
    totalDiscussionVote: {
      up: number;
      down: number;
    };
    isUser: boolean;
  };
}

export {};
