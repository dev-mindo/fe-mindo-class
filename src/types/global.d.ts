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
}

export {};
