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

  type TFile = {
    moduleId: number;
    name: string;
    url: string;
  };

  type TModuleMaterial = {
    id: number;
    productId: number;
    title: string;
    type: string;
    description: string;
    videoUrl?: string;
    file?: TFile[];
    userNote?: string;
    evaluation?: {
      id: number;
      linkUrl: string;
      feedbackUser: Array<any>;
    };
    videoLive?: {
      id: number;
      link: string;
      startAt: Date | string;
      endAt: Date | string;
      video: any;
    };
  };

  type TModuleRedirect = {
    moduleSlug: string;
    sectionSlug: string;
    classSlug: string;
    classType: string;
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
        isLocked: boolean;
        status: string;
        current: boolean;
        isFirst: boolean;
        isLast: boolean;
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
        isLocked: boolean;
        status: string;
        current: boolean;
        sectionSlug: string;
        isFirst: boolean;
        isLast: boolean;
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

  type TTaskUser = {
    uploadUrl: string;
    grade: number;
    status: string;
    createdAt: date;
  };

  type TAssignment = {
    id: number;
    moduleId: number;
    editable: boolean;
    canLate: boolean;
    startAt: string;
    endAt: string;
    taskUser: TTaskUser[];
  };

  type TUserToken = {
    token: string;
    refreshToken: string;
    user: {
      id: string;
      name: string;
      username: string;
      role: string;
    };
  };

  type TDetailParticipant = {
    userId: number;
    name: string;
    className: string;
    classType: string;
    progress: string;
    isCertificateEligible: boolean;
    totalScore: number;
    sections: Array<{
      sectionId: number;
      sectionTitle: string;
      modules: Array<{
        moduleId: number;
        moduleTitle: string;
        moduleType: string;
        quizAttempts: Array<{
          attemptId: number;
          quizId: number;
          score: number;
          startedAt: string;
          completeAt: string;
          quizTitle: string;
          status: string;
        }>;
        tasks: Array<{
          taskId: number;
          userId: number;
          productId: number;
          uploadUrl: string;
          grade: number;
          status: string;
          createdAt: string;
          updatedAt: string;
          task: {
            id: number;
          };
        }>;
      }>;
    }>;
  };

  type TClassModuleAll = {
    id: number;
    productType: string;
    publish: boolean;
    publishTime: string;
    thumbnail: string;
    title: string;
    slug: string;
    isAutoGetCertificate: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
      sections: number;
    };
    sections: Array<{
      _count: {
        module: number;
      };
    }>;
    totalModule: number;
  };

  type TClassModuleDetail = {
    id: number;
    productType: string;
    publish: boolean;
    publishTime: string;
    thumbnail: string;
    title: string;
    slug: string;
    isAutoGetCertificate: boolean;
    createdAt: string;
    updatedAt: string;
    sections: Array<{
      id: number;
      productId: number;
      position: number;
      publish: boolean;
      title: string;
      slug: string;
      type: string;
      module: Array<{
        id: number;
        sectionId: number;
        type: string;
        step: number;
        title: string;
        menuTitle: string;
        slug: string;
        description: string;
        hide: boolean;
        isLocked: boolean;
        showAt: any;
        hideAt: any;
      }>;
    }>;
  };

  type TDiscussionSection = Array<{
    id: number;
    title: string;
    module: Array<{
      id: number;
      title: string;
      discussion: Array<{
        id: number;
      }>;
      _count: {
        discussion: number;
      };
    }>;
  }>;

  type TModuleDiscussion = Array<{
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
    discussionAnswer: Array<any>;
    discussionVote: Array<any>;
    user: {
      name: string;
    };
  }>;
}

export {};
