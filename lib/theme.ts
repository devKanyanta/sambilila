// lib/theme.ts — Lernopia Brand Theme
// Professional red & white system: crimson red as the single brand color,
// deep ink for dark surfaces, warm neutral greys. No gradients.

export const colors = {
  // Primary — Brand Crimson Red
  primary: {
    50: '#fef2f2',
    100: '#fde3e3',
    200: '#fccccc',
    300: '#f7a6a6',
    400: '#ef7373',
    500: '#d92d3a', // DEFAULT — brand red
    600: '#b91f2c',
    700: '#991b26',
    800: '#7f1a21',
    900: '#6b1a1e',
  },

  // Secondary — Deep Ink (headers, footers, dark surfaces)
  secondary: {
    50: '#f4f5f7',
    100: '#e4e6ea',
    200: '#c9ccd4',
    300: '#a3a8b5',
    400: '#737a8c',
    500: '#4b5265',
    600: '#2e3441',
    700: '#232837',
    800: '#191d28',
    900: '#101319',
  },

  // Neutral — Warm Greys
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e6e6e8',
    300: '#d3d4d8',
    400: '#a2a4ab',
    500: '#71737c',
    600: '#52535b',
    700: '#3a3b41',
    800: '#232428',
    900: '#141518',
  },

  // Accent — Warm Gold (sparingly: ratings, highlights)
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
  },

  // Semantic
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  error: {
    50: '#fef2f2',
    100: '#fde3e3',
    200: '#fccccc',
    300: '#f7a6a6',
    400: '#ef7373',
    500: '#d92d3a',
    600: '#b91f2c',
    700: '#991b26',
    800: '#7f1a21',
    900: '#6b1a1e',
  },
}

// Solid color surfaces — replaces the old gradients export (kept for API compat)
export const gradients = {
  primary: colors.primary[500],
  primaryLight: colors.primary[50],
  coral: colors.primary[500],
  red: colors.primary[500],
  warm: colors.accent[500],
  forest: colors.secondary[700],
  subtle: colors.neutral[100],
  neutral: colors.neutral[100],
  card: colors.neutral[50],
}

// Theme configuration
export const theme = {
  backgrounds: {
    main: '#ffffff',
    card: '#ffffff',
    sidebar: '#ffffff',
    navbar: 'rgba(255, 255, 255, 0.92)',
    overlay: 'rgba(16, 19, 25, 0.45)',
    dark: colors.secondary[900],
    subtle: colors.neutral[100],
    section: '#ffffff',
    sectionAlt: colors.neutral[50],
  },

  borders: {
    light: colors.neutral[200],
    medium: colors.neutral[300],
    dark: colors.neutral[400],
    accent: colors.primary[500],
    focus: colors.primary[500],
  },

  text: {
    primary: colors.neutral[800],
    secondary: colors.neutral[600],
    light: colors.neutral[500],
    inverted: '#ffffff',
    accent: colors.primary[600],
    link: colors.primary[600],
  },

  states: {
    hover: {
      light: colors.neutral[100],
      primary: colors.primary[50],
      secondary: colors.secondary[50],
    },
    active: {
      light: colors.neutral[200],
      primary: colors.primary[100],
      secondary: colors.secondary[100],
    },
    focus: {
      ring: colors.primary[500],
    },
    disabled: {
      bg: colors.neutral[100],
      text: colors.neutral[400],
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(16, 19, 25, 0.04)',
    md: '0 1px 3px 0 rgba(16, 19, 25, 0.05), 0 4px 12px -2px rgba(16, 19, 25, 0.05)',
    lg: '0 2px 4px -1px rgba(16, 19, 25, 0.04), 0 10px 24px -6px rgba(16, 19, 25, 0.08)',
    xl: '0 4px 8px -2px rgba(16, 19, 25, 0.05), 0 18px 40px -8px rgba(16, 19, 25, 0.12)',
    '2xl': '0 8px 16px -4px rgba(16, 19, 25, 0.06), 0 28px 56px -12px rgba(16, 19, 25, 0.16)',
    colored: {
      primary: '0 4px 14px -4px rgba(217, 45, 58, 0.32)',
      secondary: '0 4px 14px -4px rgba(35, 40, 55, 0.28)',
      accent: '0 4px 14px -4px rgba(234, 179, 8, 0.2)',
    },
  },

  radii: {
    sm: '0.5rem',
    md: '0.625rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
}

// Semantic aliases
export const semantic = {
  brand: colors.primary[500],
  info: colors.primary[500],
  success: colors.success[500],
  warning: colors.warning[500],
  error: colors.error[500],
  online: colors.success[500],
  away: colors.warning[500],
  busy: colors.error[500],
  offline: colors.neutral[400],
}
