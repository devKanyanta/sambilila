export const QUIZ_SETTINGS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 20,
  DEFAULT_QUESTIONS: 10,
  DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,
  QUESTION_TYPES: [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '🔠' },
    { value: 'TRUE_FALSE', label: 'True or\nFalse', icon: '✓✗' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📝' }
  ] as const
} as const;
