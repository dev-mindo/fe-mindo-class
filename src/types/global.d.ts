declare global {
  type TQuizData = {
    status: string;
    quiz: {
      title: string;
      completed: number;
      totalQuestion: number;
      timeLimit: string;
      eventType: string;
      score?: number,
      totalCorrect?: number
    };
    pagination: {
      next: number;
      back: number;
      current: number;
      page: Array<{
      number: number;
        current: boolean;
        completed: boolean;
        isCorrect?: boolean
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
    title: string
    type: string
    description: string
    videoUrl: string
    file: string
  }
}

export {};
