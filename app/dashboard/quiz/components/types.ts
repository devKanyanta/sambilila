export interface QuizQuestion {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
  question: string;
  options: string[];
  correctAnswer: string;
  order: number;
}

export interface Quiz {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  questions: QuizQuestion[];
  createdAt: string;
}

export interface QuizListItem {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  createdAt: string;
  _count: {
    questions: number;
    results: number;
  };
}

export interface QuizResult {
  id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  percentage: string;
  passed: boolean;
}

export interface DetailedResult {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  correctAnswer: string;
  question: string;
  type: string;
}

export interface UserAnswers {
  [questionId: string]: string;
}

export type QuizJob = {
  id: string
  title: string
  difficulty: string
  numberOfQuestions: string
  questionType: string,
  status: 'PENDING_UPLOAD' |'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED'
  error?: string
  createdAt: string
  quiz?: Quiz
  progress?: number
}

export type JobStatusDisplay = {
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgColor: string
  progress: number
  pulse: boolean
}