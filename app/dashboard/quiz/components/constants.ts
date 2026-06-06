export const QUIZ_SETTINGS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 20,
  DEFAULT_QUESTIONS: 10,
  DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,
  QUESTION_TYPES: [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: 'list' },
    { value: 'TRUE_FALSE', label: 'True or False', icon: 'check' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', icon: 'pen' }
  ] as const
} as const;
