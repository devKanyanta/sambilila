import { colors, gradients, theme } from '@/lib/theme';

export const QUIZ_SETTINGS = {
  MIN_QUESTIONS: 5,
  MAX_QUESTIONS: 20,
  DEFAULT_QUESTIONS: 10,
  DIFFICULTY_LEVELS: ['easy', 'medium', 'hard'] as const,
  QUESTION_TYPES: [
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice', icon: '🔠' },
    { value: 'TRUE_FALSE', label: 'True/False', icon: '✓✗' },
    { value: 'SHORT_ANSWER', label: 'Short Answer', icon: '📝' }
  ] as const
} as const;

export const getThemeStyles = () => ({
  background: {
    main: theme.backgrounds.main,
    card: theme.backgrounds.card,
    sidebar: theme.backgrounds.sidebar,
    navbar: theme.backgrounds.navbar,
  },
  text: {
    primary: theme.text.primary,
    secondary: theme.text.secondary,
    light: theme.text.light,
    inverted: theme.text.inverted,
    accent: theme.text.accent,
    dark: theme.text.light,
  },
  border: {
    light: theme.borders.light,
    medium: theme.borders.medium,
    dark: theme.borders.dark,
    accent: theme.borders.accent,
  },
  state: {
    hover: {
      light: theme.states.hover.light,
      primary: theme.states.hover.primary,
    },
    active: {
      light: theme.states.active.light,
      primary: theme.states.active.primary,
    },
    disabled: theme.states.disabled,
  },
  shadow: theme.shadows,
});

export { colors, gradients };