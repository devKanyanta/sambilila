// lib/theme.ts — Lernopia Brand Theme
// Based on Lernopia.png Figma design: forest green + bright red accents + warm grey backgrounds

export const colors = {
  // Primary — Forest Green (from logo #193827)
  primary: {
    50: '#e8f0ec',
    100: '#c4d9cd',
    200: '#9dbdab',
    300: '#73a182',
    400: '#4d8567',
    500: '#2d6b4d',
    600: '#1f5238',
    700: '#193827',  // Logo dark green
    800: '#122b1d',
    900: '#0c1f14',
  },

  // Secondary — Bright Red (from Figma CTAs #FF5252 / #FC0B06)
  secondary: {
    50: '#fff5f5',
    100: '#ffe3e3',
    200: '#ffc9c9',
    300: '#ffa3a3',
    400: '#ff7a7a',
    500: '#ff5252',  // DEFAULT - Figma CTA red
    600: '#fc0b06',  // Figma bright red
    700: '#d62323',
    800: '#b11e1e',
    900: '#8c1a1a',
  },

  // Neutral — Warm Greys (from Figma backgrounds #ECECEC)
  neutral: {
    50: '#f5f5f5',
    100: '#ececec',  // Figma bg color
    200: '#e0e0e0',
    300: '#cccccc',
    400: '#a8a8a8',
    500: '#8a8a8a',
    600: '#6b6b6b',
    700: '#4d4d4d',
    800: '#2c2c2c',  // Figma text dark
    900: '#1a1a1a',
  },

  // Accent — Warm Gold/Amber
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
    50: '#edf7f0',
    100: '#d1eed9',
    200: '#a8dbb8',
    300: '#74c292',
    400: '#4da574',
    500: '#328a5b',
    600: '#256f49',
    700: '#1f593b',
    800: '#1c4832',
    900: '#193c2a',
  },

  warning: {
    50: '#fefbf3',
    100: '#fdf4e0',
    200: '#fae7c2',
    300: '#f5d498',
    400: '#efb865',
    500: '#e59f3e',
    600: '#d08329',
    700: '#ad6624',
    800: '#8c5024',
    900: '#724321',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
}

// Gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #2d6b4d 0%, #4d8567 100%)',
  primaryLight: 'linear-gradient(135deg, #e8f0ec 0%, #c4d9cd 100%)',
  coral: 'linear-gradient(135deg, #ff5252 0%, #ff7a7a 100%)',
  red: 'linear-gradient(135deg, #fc0b06 0%, #ff5252 100%)',
  warm: 'linear-gradient(135deg, #ff5252 0%, #eab308 100%)',
  forest: 'linear-gradient(135deg, #193827 0%, #2d6b4d 100%)',
  subtle: 'linear-gradient(135deg, rgba(45, 107, 77, 0.05) 0%, rgba(255, 82, 82, 0.05) 100%)',
  neutral: 'linear-gradient(135deg, #ececec 0%, #e0e0e0 100%)',
  card: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
}

// Theme configuration
export const theme = {
  backgrounds: {
    main: '#ececec',          // Figma warm grey
    card: '#ffffff',
    sidebar: '#ffffff',
    navbar: 'rgba(255, 255, 255, 0.95)',
    overlay: 'rgba(26, 26, 26, 0.5)',
    dark: colors.neutral[900],
    subtle: colors.neutral[50],
    section: '#ececec',       // Figma section bg
    sectionAlt: '#f5f5f5',    // Alternating section
  },

  borders: {
    light: colors.neutral[200],   // #e0e0e0
    medium: colors.neutral[300],  // #cccccc
    dark: colors.neutral[500],    // #8a8a8a
    accent: colors.primary[400],  // #4d8567
    focus: colors.primary[500],   // #2d6b4d
  },

  text: {
    primary: colors.neutral[800],  // #2c2c2c
    secondary: colors.neutral[600], // #6b6b6b
    light: colors.neutral[500],    // #8a8a8a
    inverted: '#ffffff',
    accent: colors.primary[600],   // #1f5238
    link: colors.primary[500],     // #2d6b4d
  },

  states: {
    hover: {
      light: colors.neutral[100],     // #ececec
      primary: colors.primary[50],    // #e8f0ec
      secondary: colors.secondary[50], // #fff5f5
    },
    active: {
      light: colors.neutral[200],      // #e0e0e0
      primary: colors.primary[100],    // #c4d9cd
      secondary: colors.secondary[100], // #ffe3e3
    },
    focus: {
      ring: colors.primary[500],       // #2d6b4d
    },
    disabled: {
      bg: colors.neutral[100],
      text: colors.neutral[400],
    },
  },

  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
    md: '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
    lg: '0 4px 12px -2px rgba(0, 0, 0, 0.08)',
    xl: '0 8px 24px -4px rgba(0, 0, 0, 0.08)',
    '2xl': '0 12px 32px -6px rgba(0, 0, 0, 0.1)',
    colored: {
      primary: '0 4px 12px -4px rgba(45, 107, 77, 0.2)',
      secondary: '0 4px 12px -4px rgba(255, 82, 82, 0.25)',
      accent: '0 4px 12px -4px rgba(234, 179, 8, 0.2)',
    },
  },

  radii: {
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
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
