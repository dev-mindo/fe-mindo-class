declare global {
  type TQuizAll = {
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
      }>;
      _count: {
        question: number;
      };
    } | undefined;

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
}

export {};
