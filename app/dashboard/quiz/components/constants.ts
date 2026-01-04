import { colors, gradients, theme } from '@/lib/theme';

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

export const getThemeStyles = () => ({
  background: {
    main: '#ffffff',
    card: '#ffffff',
    sidebar: '#f8fafc',
    navbar: '#ffffff',
  },
  text: {
    primary: '#1f2937',
    secondary: '#6b7280',
    light: '#9ca3af',
    inverted: '#ffffff',
    accent: colors.primary[500],
    dark: '#374151',
  },
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    accent: colors.primary[300],
  },
  state: {
    hover: {
      light: '#f3f4f6',
      primary: colors.primary[50],
    },
    active: {
      light: '#e5e7eb',
      primary: colors.primary[100],
    },
    disabled: '#f3f4f6',
  },
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    xl: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
});

export { colors, gradients };